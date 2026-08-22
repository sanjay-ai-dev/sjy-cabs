'use client';

import React, { useState, useEffect } from 'react';
import { 
  Car, 
  User, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Navigation, 
  Search, 
  MessageSquare, 
  Copy, 
  Check, 
  PlusCircle, 
  Users, 
  AlertCircle,
  Sparkles,
  Zap,
  Filter
} from 'lucide-react';
import { CarpoolPost } from '@/lib/carpool-store';
import { PostRideModal } from '@/components/post-ride-modal';
import { useToast } from '@/components/toast-provider';

export function CarpoolCommunityFeed() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<CarpoolPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'OFFER' | 'SEEK' | 'FEMALE_ONLY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Booking Modal State
  const [selectedPostForBooking, setSelectedPostForBooking] = useState<CarpoolPost | null>(null);
  const [bookerName, setBookerName] = useState('');
  const [bookerPhone, setBookerPhone] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = `/api/carpool?`;
      if (activeTab === 'OFFER' || activeTab === 'SEEK') {
        url += `type=${activeTab}&`;
      } else if (activeTab === 'FEMALE_ONLY') {
        url += `femaleOnly=true&`;
      }
      if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}&`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Error fetching carpool posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab, searchQuery]);

  const handlePostCreated = (newPost: CarpoolPost) => {
    setPosts((prev) => [newPost, ...prev]);
    toast({
      tone: 'success',
      title: 'Ride Posted Successfully!',
      detail: `Your ${newPost.type === 'OFFER' ? '#OfferRide' : '#SeekRide'} is now live on the community hub.`,
    });
  };

  const handleCopyFormattedPost = (post: CarpoolPost) => {
    let formattedText = '';
    if (post.type === 'OFFER') {
      formattedText = `🚗 #OfferRide — DailyCab Commuters Community\n• Driver: ${post.driverName} (${post.driverGender === 'female' ? 'Female Driver 🚺' : 'Male'})\n• Route: ${post.routeFrom} ➔ ${post.routeTo}\n• Date/Freq: ${post.departureDate}\n• Time: Departure ${post.departureTime}${post.returnTime ? ` | Return ${post.returnTime}` : ''}\n• Seats Available: ${post.availableSeats}/${post.totalSeats} seats ${post.isFullyBooked ? '(🔴 FULLY BOOKED)' : ''}\n• Vehicle: ${post.vehicleModel || 'Car'} | ${post.fuelShare || 'Fuel Share'}\n${post.isFemaleOnly ? '• 🚺 Female-Safe Ride\n' : ''}${post.liveGpsEnabled ? '• 📍 Live GPS Tracked\n' : ''}• Contact: WhatsApp +91 ${post.phone}`;
    } else {
      formattedText = `🙋 #SeekRide — DailyCab Commuters Community\n• Passenger: ${post.driverName}\n• Route Needed: ${post.routeFrom} ➔ ${post.routeTo}\n• Date/Freq: ${post.departureDate}\n• Time Needed: ${post.departureTime}\n• Contact: WhatsApp +91 ${post.phone}`;
    }

    navigator.clipboard.writeText(formattedText);
    setCopiedId(post.id);
    toast({
      tone: 'success',
      title: 'Copied to Clipboard!',
      detail: 'Post text copied. Paste directly into WhatsApp groups!',
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostForBooking || !bookerName || !bookerPhone) return;

    setIsBookingSubmitting(true);
    try {
      const res = await fetch('/api/carpool', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: selectedPostForBooking.id,
          action: 'BOOK_SEAT',
          userName: bookerName,
          userPhone: bookerPhone,
        }),
      });

      const data = await res.json();
      if (data.success && data.post) {
        toast({
          tone: data.isWaitlist ? 'info' : 'success',
          title: data.isWaitlist ? `Added to Waitlist #${data.waitlistNumber}` : 'Seat Booked!',
          detail: data.message,
        });
        // Update local state
        setPosts((prev) => prev.map((p) => (p.id === data.post.id ? data.post : p)));
        setSelectedPostForBooking(null);
        setBookerName('');
        setBookerPhone('');
      } else {
        toast({
          tone: 'error',
          title: 'Booking Error',
          detail: data.error || 'Failed to book seat',
        });
      }
    } catch (err) {
      toast({
        tone: 'error',
        title: 'Network Error',
        detail: 'Please check your connection and try again.',
      });
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-content flex items-center gap-2">
            <span>Live Commuter Listings</span>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-micro px-2.5 py-0.5 rounded-full font-black">
              {posts.length} Active
            </span>
          </h2>
          <p className="text-xs text-content-secondary">
            Find ride partners, share fuel costs, or form cab pools between Dhar & Indore
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-black px-5 py-3 rounded-2xl shadow-lg shadow-brand/20 transition-all text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a Ride (#OfferRide / #SeekRide)</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-card p-4 border border-hairline space-y-4 rounded-2xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-brand text-white shadow-md'
                  : 'bg-surface-2 text-content-secondary hover:text-content'
              }`}
            >
              All Listings
            </button>
            <button
              onClick={() => setActiveTab('OFFER')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'OFFER'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-surface-2 text-content-secondary hover:text-content'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Ride Offers (#OfferRide)</span>
            </button>
            <button
              onClick={() => setActiveTab('SEEK')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'SEEK'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-surface-2 text-content-secondary hover:text-content'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Ride Requests (#SeekRide)</span>
            </button>
            <button
              onClick={() => setActiveTab('FEMALE_ONLY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'FEMALE_ONLY'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-surface-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Female-Safe Rides 🚺</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colony, area, or driver..."
              className="w-full bg-surface-2 border border-hairline rounded-xl pl-9 pr-3.5 py-2 text-xs text-content focus:border-brand focus:outline-none"
            />
          </div>

        </div>
      </div>

      {/* Feed Listings Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-content-muted">
          Loading carpool listings...
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card p-12 text-center border border-hairline space-y-4 rounded-3xl">
          <div className="p-4 rounded-full bg-surface-2 w-16 h-16 mx-auto flex items-center justify-center text-content-muted">
            <Car className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-content">No active listings found</h3>
          <p className="text-xs text-content-secondary max-w-sm mx-auto">
            Be the first commuter to post a ride offer or request on this route!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-brand text-white font-bold px-5 py-2.5 rounded-xl text-xs"
          >
            <PlusCircle className="w-4 h-4" /> Post First Ride
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => {
            const isOffer = post.type === 'OFFER';
            const whatsappUrl = `https://wa.me/91${post.phone}?text=${encodeURIComponent(
              `Hi ${post.driverName}, I saw your ${isOffer ? '#OfferRide' : '#SeekRide'} post on DailyCab Community for ${post.routeFrom} to ${post.routeTo} (${post.departureTime}). Is a seat available?`
            )}`;

            const waitlistCount = post.bookings.filter((b) => b.isWaitlist).length;

            return (
              <div
                key={post.id}
                className={`glass-card p-6 border transition-all space-y-4 rounded-3xl relative overflow-hidden flex flex-col justify-between ${
                  post.isFemaleOnly
                    ? 'border-rose-500/40 bg-gradient-to-br from-rose-500/5 via-surface-1 to-surface-1'
                    : isOffer
                    ? 'border-emerald-500/30 hover:border-emerald-500/60'
                    : 'border-indigo-500/30 hover:border-indigo-500/60'
                }`}
              >
                
                {/* Card Top Header */}
                <div className="space-y-3">
                  
                  <div className="flex items-center justify-between gap-2">
                    
                    {/* Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-micro font-black flex items-center gap-1.5 uppercase tracking-wider ${
                          isOffer
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                        }`}
                      >
                        {isOffer ? <Car className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        {isOffer ? '#OfferRide' : '#SeekRide'}
                      </span>

                      {post.isFemaleOnly && (
                        <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-full text-micro font-black flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> 🚺 Female-Safe
                        </span>
                      )}
                    </div>

                    {/* Occupancy Status Badge */}
                    {isOffer && (
                      <div>
                        {post.isFullyBooked ? (
                          <span className="bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 px-2.5 py-1 rounded-full text-micro font-black flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> FULLY BOOKED
                          </span>
                        ) : (
                          <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-micro font-black flex items-center gap-1">
                            🟢 {post.availableSeats}/{post.totalSeats} Seats Left
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Route From ➔ To */}
                  <div className="space-y-1">
                    <div className="text-micro font-bold text-content-muted uppercase tracking-wider">
                      {isOffer ? 'Car Owner Route' : 'Passenger Route Request'}
                    </div>
                    <div className="text-lg font-black text-content font-display flex items-center gap-2">
                      <span className="text-brand">{post.routeFrom}</span>
                      <span className="text-content-muted">➔</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{post.routeTo}</span>
                    </div>
                  </div>

                  {/* Date, Time & Driver Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-surface-2/70 p-3 rounded-2xl border border-hairline">
                    <div className="space-y-1">
                      <div className="text-micro font-bold text-content-muted flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand" /> Date / Freq
                      </div>
                      <div className="font-extrabold text-content">{post.departureDate}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-micro font-bold text-content-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" /> Departure
                      </div>
                      <div className="font-extrabold text-content">
                        {post.departureTime}
                        {post.returnTime && <span className="text-content-muted text-micro"> (Ret: {post.returnTime})</span>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-micro font-bold text-content-muted flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-indigo-500" /> Driver / Poster
                      </div>
                      <div className="font-extrabold text-content flex items-center gap-1">
                        {post.driverName}
                        {post.driverGender === 'female' && <span className="text-rose-500">🚺</span>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-micro font-bold text-content-muted flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-amber-500" /> Vehicle / Fuel
                      </div>
                      <div className="font-extrabold text-content truncate">
                        {post.vehicleModel || post.fuelShare || 'Car Share'}
                      </div>
                    </div>
                  </div>

                  {/* Notes / Special Tags */}
                  {post.notes && (
                    <p className="text-xs text-content-secondary italic bg-surface-1 p-2.5 rounded-xl border border-hairline">
                      &quot;{post.notes}&quot;
                    </p>
                  )}

                  {/* Safety Features Bar */}
                  <div className="flex flex-wrap gap-3 text-micro font-bold text-content-muted pt-1">
                    {post.liveGpsEnabled && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Navigation className="w-3.5 h-3.5" /> 📍 Live Mobile GPS
                      </span>
                    )}
                    {waitlistCount > 0 && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        ⏳ {waitlistCount} on Waitlist
                      </span>
                    )}
                  </div>

                </div>

                {/* Card Actions Bottom Bar */}
                <div className="pt-4 border-t border-hairline space-y-2 mt-4">
                  
                  <div className="flex items-center gap-2">
                    
                    {/* Book Seat Action (For Ride Offers) */}
                    {isOffer && (
                      <button
                        onClick={() => setSelectedPostForBooking(post)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                          post.isFullyBooked
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>{post.isFullyBooked ? 'Join Waitlist' : 'Book 1 Seat'}</span>
                      </button>
                    )}

                    {/* Direct WhatsApp Message Button */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 rounded-xl bg-surface-2 hover:bg-surface-3 text-content font-bold text-xs flex items-center justify-center gap-1.5 border border-hairline transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-500" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Copy Formatted Post Button */}
                    <button
                      onClick={() => handleCopyFormattedPost(post)}
                      className="p-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-content-secondary hover:text-content border border-hairline transition-colors"
                      title="Copy formatted post for WhatsApp sharing"
                    >
                      {copiedId === post.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Post Modal */}
      <PostRideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Quick Booking / Waitlist Dialog */}
      {selectedPostForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-hairline bg-canvas text-content space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="text-lg font-black font-display">
                {selectedPostForBooking.isFullyBooked ? '⏳ Join Waitlist' : '🟢 Reserve Seat'}
              </h3>
              <button
                onClick={() => setSelectedPostForBooking(null)}
                className="text-content-muted hover:text-content"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-content-secondary leading-relaxed">
              {selectedPostForBooking.isFullyBooked
                ? `This trip (${selectedPostForBooking.routeFrom} ➔ ${selectedPostForBooking.routeTo}) is currently fully booked. Entering your name will place you on the Waitlist!`
                : `Reserving a seat on ${selectedPostForBooking.driverName}'s car (${selectedPostForBooking.routeFrom} ➔ ${selectedPostForBooking.routeTo}) at ${selectedPostForBooking.departureTime}.`}
            </p>

            <form onSubmit={handleBookingSubmit} className="space-y-3">
              <div>
                <label className="block text-micro font-bold text-content-secondary mb-1">Your Full Name *</label>
                <input
                  type="text"
                  value={bookerName}
                  onChange={(e) => setBookerName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  required
                  className="w-full bg-surface-2 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-content focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-micro font-bold text-content-secondary mb-1">WhatsApp / Phone *</label>
                <input
                  type="tel"
                  value={bookerPhone}
                  onChange={(e) => setBookerPhone(e.target.value)}
                  placeholder="e.g. 98260XXXXX"
                  required
                  className="w-full bg-surface-2 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-content focus:border-brand focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPostForBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-content-secondary hover:text-content"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBookingSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                >
                  {isBookingSubmitting ? 'Confirming...' : selectedPostForBooking.isFullyBooked ? 'Join Waitlist' : 'Confirm Seat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
