import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiOutlineStar, HiOutlineChatAlt } from 'react-icons/hi';

const StarRating = ({ rating, onRate, size = 'text-2xl' }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onRate?.(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className={`${size} transition-all duration-200 ${star <= (hover || rating) ? 'text-yellow-400 scale-110' : 'text-gray-300 dark:text-dark-600'
                        } ${onRate ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
                    disabled={!onRate}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

export default function FeedbackPage() {
    const [form, setForm] = useState({ mealType: 'lunch', rating: 0, comment: '', anonymous: false });
    const [trend, setTrend] = useState([]);
    const [todayFeedback, setTodayFeedback] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [trendRes, feedbackRes, compRes] = await Promise.all([
                api.get('/feedback/trend'),
                api.get('/feedback'),
                api.get('/feedback/complaints').catch(() => ({ data: { complaints: [] } })),
            ]);
            setTrend(trendRes.data.trend.map((t) => ({ date: t._id, rating: Number(t.avgRating.toFixed(1)), count: t.count })));
            setTodayFeedback(feedbackRes.data.feedback);
            setComplaints(compRes.data.complaints || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        try {
            await api.post('/feedback', form);
            toast.success('Feedback submitted! ⭐');
            setForm({ mealType: 'lunch', rating: 0, comment: '', anonymous: false });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit feedback');
        }
    };

    const mealEmoji = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

    if (loading) {
        return (
            <div className="page-container">
                <div className="glass-card-solid p-8 animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-dark-700 rounded w-1/3" />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="mb-8 animate-fade-in">
                <h1 className="section-title">Meal Feedback</h1>
                <p className="text-gray-500 dark:text-gray-400 -mt-4">Rate your meals and share your thoughts</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Submit Feedback */}
                <div className="glass-card-solid p-6 animate-slide-up">
                    <div className="flex items-center gap-2 mb-6">
                        <HiOutlineStar className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rate Today's Meal</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meal</label>
                            <div className="flex gap-3">
                                {['breakfast', 'lunch', 'dinner'].map((meal) => (
                                    <button
                                        key={meal}
                                        type="button"
                                        onClick={() => setForm({ ...form, mealType: meal })}
                                        className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${form.mealType === meal
                                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500/30'
                                                : 'bg-gray-50 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600'
                                            }`}
                                    >
                                        <span>{mealEmoji[meal]}</span>
                                        <span className="capitalize">{meal}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                            <StarRating rating={form.rating} onRate={(r) => setForm({ ...form, rating: r })} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment (optional)</label>
                            <textarea
                                value={form.comment}
                                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                                placeholder="Share your thoughts about the meal..."
                                className="input-field h-24 resize-none"
                                maxLength={500}
                                id="feedback-comment"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.anonymous}
                                onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                                id="feedback-anonymous"
                            />
                            <label className="text-sm text-gray-600 dark:text-gray-400">Submit anonymously</label>
                        </div>

                        <button type="submit" className="btn-primary w-full" id="feedback-submit">
                            Submit Feedback
                        </button>
                    </form>
                </div>

                {/* Satisfaction Trend */}
                <div className="glass-card-solid p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Satisfaction Trend (30 days)</h3>
                    {trend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                                <YAxis domain={[0, 5]} stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [value, 'Avg Rating']}
                                />
                                <Line type="monotone" dataKey="rating" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: '#eab308' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">No feedback data yet</div>
                    )}
                </div>
            </div>

            {/* Today's Feedback */}
            <div className="glass-card-solid p-6 mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-2 mb-4">
                    <HiOutlineChatAlt className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today's Reviews</h3>
                </div>
                {todayFeedback.length > 0 ? (
                    <div className="space-y-3">
                        {todayFeedback.map((f, i) => (
                            <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-700/50 border border-gray-100 dark:border-dark-600">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span>{mealEmoji[f.mealType]}</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-200 capitalize">{f.mealType}</span>
                                        <span className="text-sm text-gray-400">by {f.userId?.name || 'Unknown'}</span>
                                    </div>
                                    <StarRating rating={f.rating} size="text-sm" />
                                </div>
                                {f.comment && <p className="text-sm text-gray-500 dark:text-gray-400">{f.comment}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">No reviews today yet</p>
                )}
            </div>

            {/* Most Complained */}
            {complaints.length > 0 && (
                <div className="glass-card-solid p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">⚠️ Recent Complaints</h3>
                    <div className="space-y-2">
                        {complaints.slice(0, 5).map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-200">
                                        {mealEmoji[c._id.mealType]} {c._id.mealType} on {c._id.date}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-0.5">{c.count} complaint(s)</p>
                                </div>
                                <StarRating rating={Math.round(c.avgRating)} size="text-sm" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
