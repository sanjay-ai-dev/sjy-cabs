from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime, timedelta
try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    import logging
    logger = logging.getLogger(__name__)

try:
    from ortools.constraint_solver import routing_enums_pb2
    from ortools.constraint_solver import pywrapcp
    ORTOOLS_AVAILABLE = True
except ImportError:
    ORTOOLS_AVAILABLE = False

from .osrm_client import get_distance_matrix, get_trip_order

@dataclass
class StopInfo:
    entity_id: str
    name: str
    lat: float
    lon: float
    passengers: int = 1
    is_pickup: bool = True

@dataclass
class ManifestStop:
    seq: int
    type: str # 'pickup', 'drop', 'parcel_pickup', 'parcel_drop'
    entity_id: str
    name: str
    lat: float
    lon: float
    eta: Optional[str] = None

async def optimize_trip_sequence(
    depot_coord: tuple[float, float],
    pickups: List[StopInfo],
    drops: List[StopInfo],
    parcels_pickup: List[StopInfo],
    parcels_drop: List[StopInfo],
    start_time: datetime
) -> List[ManifestStop]:
    """Optimize route using OR-Tools with capacity and precedence constraints."""
    
    # 0 is depot (start)
    all_nodes = [depot_coord]
    node_mapping = [] # Map index to (StopInfo, type_string)
    
    # Combine pickups and drops
    passengers_p = [(p, 'pickup') for p in pickups]
    passengers_d = [(d, 'drop') for d in drops]
    parcels_p = [(p, 'parcel_pickup') for p in parcels_pickup]
    parcels_d = [(d, 'parcel_drop') for d in parcels_drop]
    
    combined_stops = passengers_p + passengers_d + parcels_p + parcels_d
    
    for stop, t in combined_stops:
        all_nodes.append((stop.lon, stop.lat))
        node_mapping.append((stop, t))
        
    matrix_data = await get_distance_matrix(all_nodes)
    durations = matrix_data["durations"]
    
    if not durations or not ORTOOLS_AVAILABLE:
        logger.warning("using_fallback_tsp_optimizer")
        return await _fallback_optimizer(all_nodes, node_mapping, start_time)
        
    # Setup OR-Tools model
    manager = pywrapcp.RoutingIndexManager(len(all_nodes), 1, 0)
    routing = pywrapcp.RoutingModel(manager)
    
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(durations[from_node][to_node])
        
    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    # Capacity constraint (Max 6 passengers)
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        if from_node == 0:
            return 0
        stop, t = node_mapping[from_node - 1]
        if t == 'pickup':
            return stop.passengers
        elif t == 'drop':
            return -stop.passengers
        return 0 # Parcels don't affect passenger capacity in this simplified version
        
    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimension(
        demand_callback_index,
        0,  # null capacity slack
        6,  # vehicle maximum capacity
        True,  # start cumul to zero
        "Capacity"
    )
    
    # Precedence constraints (Pickup before Drop)
    # This requires matching entity_id
    solver = routing.solver()
    for i, (p_stop, p_t) in enumerate(node_mapping):
        if p_t in ('pickup', 'parcel_pickup'):
            # Find matching drop
            for j, (d_stop, d_t) in enumerate(node_mapping):
                if d_t in ('drop', 'parcel_drop') and p_stop.entity_id == d_stop.entity_id:
                    p_index = manager.NodeToIndex(i + 1)
                    d_index = manager.NodeToIndex(j + 1)
                    routing.AddPickupAndDelivery(p_index, d_index)
                    solver.Add(routing.NextVar(p_index) != p_index)
                    solver.Add(
                        routing.GetDimensionOrDie("Capacity").CumulVar(p_index) <=
                        routing.GetDimensionOrDie("Capacity").CumulVar(d_index)
                    )
    
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION)
    search_parameters.time_limit.seconds = 2
    
    solution = routing.SolveWithParameters(search_parameters)
    if solution:
        return _extract_solution(manager, routing, solution, node_mapping, durations, start_time)
    else:
        logger.error("ortools_no_solution_found")
        return await _fallback_optimizer(all_nodes, node_mapping, start_time)

def _extract_solution(manager, routing, solution, node_mapping, durations, start_time) -> List[ManifestStop]:
    manifest = []
    index = routing.Start(0)
    seq = 1
    current_time = start_time
    
    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        next_index = solution.Value(routing.NextVar(index))
        next_node = manager.IndexToNode(next_index)
        
        if node != 0:
            stop, t = node_mapping[node - 1]
            manifest.append(ManifestStop(
                seq=seq,
                type=t,
                entity_id=stop.entity_id,
                name=stop.name,
                lat=stop.lat,
                lon=stop.lon,
                eta=current_time.isoformat()
            ))
            seq += 1
            
        # Add transit time to next node
        if not routing.IsEnd(next_index):
            transit_seconds = durations[node][next_node]
            current_time += timedelta(seconds=transit_seconds)
            
        index = next_index
        
    return manifest

async def _fallback_optimizer(all_nodes, node_mapping, start_time) -> List[ManifestStop]:
    """Simple TSP fallback using OSRM trip endpoint."""
    ordered_indices = await get_trip_order(all_nodes, fixed_start=True)
    
    manifest = []
    seq = 1
    current_time = start_time
    
    for idx in ordered_indices:
        if idx == 0:
            continue
        stop, t = node_mapping[idx - 1]
        manifest.append(ManifestStop(
            seq=seq,
            type=t,
            entity_id=stop.entity_id,
            name=stop.name,
            lat=stop.lat,
            lon=stop.lon,
            eta=current_time.isoformat()
        ))
        seq += 1
        current_time += timedelta(minutes=15) # dummy ETA
        
    return manifest
