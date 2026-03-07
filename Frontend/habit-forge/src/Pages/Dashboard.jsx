import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState('');

  useEffect(() => { fetchHabits(); }, []);

  const fetchHabits = async () => {
    try {
      const res = await api.get('/habits');
      setHabits(res.data);
    } catch {
      setError('فشل تحميل العادات');
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      const res = await api.post('/habits', { title, description });
      setHabits([...habits, res.data]);
      setTitle('');
      setDescription('');
    } catch {
      setError('فشل إضافة العادة');
    }
  };

  const confirmComplete = async () => {
    try {
      const res = await api.put(`/habits/${modal._id}/complete`, { mood, note });
      setHabits(habits.map(h => h._id === modal._id ? res.data : h));
      setModal(null);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تسجيل الإتمام');
      setModal(null);
    }
  };

  const deleteHabit = async (id) => {
    try {
      await api.delete(`/habits/${id}`);
      setHabits(habits.filter(h => h._id !== id));
    } catch {
      setError('فشل حذف العادة');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isCompletedToday = (completedDates) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return completedDates.some(entry => {
      const d = new Date(entry.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  };

  const getStreak = (completedDates) => {
    if (completedDates.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 30; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const found = completedDates.some(entry => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === day.getTime();
      });
      if (found) streak++;
      else break;
    }
    return streak;
  };

  const totalCompleted = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
  const completedToday = habits.filter(h => isCompletedToday(h.completedDates)).length;

  if (loading) return (
    <div style={styles.loadingScreen}>
      <div style={styles.loadingDot}></div>
    </div>
  );

  return (
    <div style={styles.root} dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }

      .glow-btn {
        background: linear-gradient(135deg, #7209b7, #560bad);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 12px;
        font-family: 'Tajawal', sans-serif;
        font-size: 15px;
         font-weight: 700;
        cursor: pointer;
        box-shadow: 0 0 20px rgba(114, 9, 183, 0.5), 0 0 40px rgba(114, 9, 183, 0.2);
        transition: all 0.3s ease;
        letter-spacing: 0.5px;
            }
      .glow-btn:hover {
        box-shadow: 0 0 30px rgba(114, 9, 183, 0.8), 0 0 60px rgba(114, 9, 183, 0.4);
        transform: translateY(-2px);
        }
        .glow-btn:active { transform: translateY(0); }

        .complete-btn {
          background: linear-gradient(135deg, #2d6a4f, #1b4332);
          color: #52b788;
          border: 1px solid rgba(82,183,136,0.3);
          padding: 10px 20px;
          border-radius: 10px;
          font-family: 'Tajawal', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 15px rgba(82,183,136,0.15);
        }
        .complete-btn:hover {
          box-shadow: 0 0 25px rgba(82,183,136,0.4);
          transform: translateY(-2px);
        }
        .complete-btn-done {
          background: rgba(82,183,136,0.1);
          color: #52b788;
          border: 1px solid rgba(82,183,136,0.2);
          padding: 10px 20px;
          border-radius: 10px;
          font-family: 'Tajawal', sans-serif;
          font-size: 14px;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .delete-btn {
          background: rgba(230,57,70,0.1);
          color: #e63946;
          border: 1px solid rgba(230,57,70,0.2);
          padding: 10px 16px;
          border-radius: 10px;
          font-family: 'Tajawal', sans-serif;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .delete-btn:hover {
          background: rgba(230,57,70,0.2);
          box-shadow: 0 0 15px rgba(230,57,70,0.3);
        }
        .habit-card {
          background: linear-gradient(135deg, #13131a, #1a1a25);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .habit-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 4px; height: 100%;
          background: linear-gradient(180deg, #e63946, #c1121f);
          border-radius: 4px 0 0 4px;
        }
        .habit-card:hover {
          border-color: rgba(230,57,70,0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        }
        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 18px;
          color: #e8e8f0;
          font-family: 'Tajawal', sans-serif;
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
          direction: rtl;
        }
        .input-field:focus {
          border-color: rgba(230,57,70,0.5);
          box-shadow: 0 0 15px rgba(230,57,70,0.1);
          background: rgba(255,255,255,0.07);
        }
        .input-field::placeholder { color: rgba(255,255,255,0.3); }
        .stat-card {
          background: linear-gradient(135deg, #13131a, #1a1a25);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .range-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,0.1);
          outline: none;
        }
        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e63946, #c1121f);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(230,57,70,0.6);
        }
        .logout-btn {
          background: transparent;
          border: 1px solid rgba(230,57,70,0.3);
          color: #e63946;
          padding: 10px 20px;
          border-radius: 10px;
          font-family: 'Tajawal', sans-serif;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .logout-btn:hover {
          background: rgba(230,57,70,0.1);
          box-shadow: 0 0 15px rgba(230,57,70,0.2);
        }
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100;
        }
        .modal-box {
          background: linear-gradient(135deg, #13131a, #1a1a25);
          border: 1px solid rgba(230,57,70,0.2);
          border-radius: 20px;
          padding: 32px;
          width: 100%; max-width: 460px;
          margin: 16px;
          box-shadow: 0 0 60px rgba(230,57,70,0.15);
        }
        .cancel-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          padding: 12px 24px;
          border-radius: 12px;
          font-family: 'Tajawal', sans-serif;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .cancel-btn:hover { background: rgba(255,255,255,0.1); }
        .confirm-btn {
          background: linear-gradient(135deg, #2d6a4f, #1b4332);
          color: #52b788;
          border: 1px solid rgba(82,183,136,0.3);
          padding: 12px 24px;
          border-radius: 12px;
          font-family: 'Tajawal', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 0 20px rgba(82,183,136,0.2);
        }
        .confirm-btn:hover { box-shadow: 0 0 30px rgba(82,183,136,0.4); }
        .textarea-field {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 18px;
          color: #e8e8f0;
          font-family: 'Tajawal', sans-serif;
          font-size: 14px;
          outline: none;
          resize: none;
          direction: rtl;
          transition: all 0.3s;
        }
        .textarea-field:focus {
          border-color: rgba(230,57,70,0.4);
          box-shadow: 0 0 15px rgba(230,57,70,0.08);
        }
        .textarea-field::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.navFire}>🔥</span>
          <span style={styles.navTitle}>Habit Forge</span>
        </div>
        <button className="logout-btn" onClick={logout}>تسجيل الخروج</button>
      </nav>

      <div style={styles.container}>

        {error && (
          <div style={styles.errorBanner}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={styles.errorClose}>✕</button>
          </div>
        )}

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div className="stat-card">
            <p style={{...styles.statNum, color: '#e63946'}}>{habits.length}</p>
            <p style={styles.statLabel}>إجمالي العادات</p>
          </div>
          <div className="stat-card">
            <p style={{...styles.statNum, color: '#52b788'}}>{completedToday}</p>
            <p style={styles.statLabel}>مكتملة اليوم</p>
          </div>
          <div className="stat-card">
            <p style={{...styles.statNum, color: '#f4a261'}}>{totalCompleted}</p>
            <p style={styles.statLabel}>إجمالي الإتمامات</p>
          </div>
        </div>

        {/* Add Habit */}
        <div style={styles.addCard}>
          <h2 style={styles.sectionTitle}>إضافة عادة جديدة</h2>
          <form onSubmit={addHabit} style={styles.form}>
            <input
              className="input-field"
              type="text"
              placeholder="اسم العادة (مثال: برمجة يومية 💻)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              className="input-field"
              type="text"
              placeholder="وصف مختصر (اختياري)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit" className="glow-btn" style={{width: '100%', padding: '14px'}}>
              + إضافة العادة
            </button>
          </form>
        </div>

        {/* Habits */}
        <div>
          <h2 style={styles.sectionTitle}>عاداتي</h2>
          {habits.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>🎯</p>
              <p style={styles.emptyText}>لا توجد عادات بعد — أضف عادتك الأولى!</p>
            </div>
          ) : (
            <div style={styles.habitsList}>
              {habits.map(habit => (
                <div key={habit._id} className="habit-card">
                  <div style={styles.habitRow}>
                    <div style={styles.habitInfo}>
                      <h3 style={styles.habitTitle}>{habit.title}</h3>
                      {habit.description && (
                        <p style={styles.habitDesc}>{habit.description}</p>
                      )}
                      <div style={styles.habitMeta}>
                        <span style={styles.streakBadge}>🔥 {getStreak(habit.completedDates)} يوم متتالي</span>
                        <span style={styles.totalBadge}>✅ {habit.completedDates.length} إجمالي</span>
                      </div>
                    </div>
                    <div style={styles.habitActions}>
                      {isCompletedToday(habit.completedDates) ? (
                        <button className="complete-btn-done">✅ تم اليوم</button>
                      ) : (
                        <button className="complete-btn" onClick={() => { setModal(habit); setMood(5); setNote(''); }}>
                          إتمام
                        </button>
                      )}
                      <button className="delete-btn" onClick={() => deleteHabit(habit._id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-box" dir="rtl">
            <h3 style={styles.modalTitle}>إتمام: {modal.title}</h3>
            <div style={styles.modalSection}>
              <label style={styles.modalLabel}>كيف مزاجك اليوم؟ <span style={{color:'#e63946', fontWeight:'900'}}>{mood}/10</span></label>
              <input
                type="range" min="1" max="10" value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="range-slider"
                style={{marginTop: '10px'}}
              />
              <div style={styles.moodEmojis}>
                <span>😞 1</span><span>😐 5</span><span>😊 10</span>
              </div>
            </div>
            <div style={styles.modalSection}>
              <label style={styles.modalLabel}>ملاحظة اليوم (اختياري)</label>
              <textarea
                className="textarea-field"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="كيف كانت تجربتك اليوم؟"
                rows={3}
                style={{marginTop: '10px'}}
              />
            </div>
            <div style={styles.modalBtns}>
              <button className="confirm-btn" onClick={confirmComplete}>تأكيد الإتمام ✅</button>
              <button className="cancel-btn" onClick={() => setModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Tajawal', sans-serif", color: '#e8e8f0' },
  loadingScreen: { minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingDot: { width: 40, height: 40, borderRadius: '50%', background: '#e63946', boxShadow: '0 0 30px rgba(230,57,70,0.8)', animation: 'pulse 1s infinite' },
  navbar: { background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  navBrand: { display: 'flex', alignItems: 'center', gap: 10 },
  navFire: { fontSize: 28 },
  navTitle: { fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg, #e63946, #f4a261)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  container: { maxWidth: 720, margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 28 },
  errorBanner: { background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#e63946' },
  errorClose: { background: 'none', border: 'none', color: '#e63946', fontSize: 16, cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  statNum: { fontSize: 36, fontWeight: 900, lineHeight: 1 },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 8, fontWeight: 500 },
  addCard: { background: 'linear-gradient(135deg, #13131a, #1a1a25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#e8e8f0', marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  emptyState: { background: 'linear-gradient(135deg, #13131a, #1a1a25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '48px 24px', textAlign: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 16 },
  habitsList: { display: 'flex', flexDirection: 'column', gap: 12 },
  habitRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  habitInfo: { flex: 1 },
  habitTitle: { fontSize: 17, fontWeight: 700, color: '#e8e8f0', marginBottom: 4 },
  habitDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 8 },
  habitMeta: { display: 'flex', gap: 12 },
  streakBadge: { fontSize: 13, color: '#f4a261', background: 'rgba(244,162,97,0.1)', padding: '4px 10px', borderRadius: 20 },
  totalBadge: { fontSize: 13, color: '#52b788', background: 'rgba(82,183,136,0.1)', padding: '4px 10px', borderRadius: 20 },
  habitActions: { display: 'flex', gap: 8, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#e8e8f0', marginBottom: 24 },
  modalSection: { marginBottom: 20 },
  modalLabel: { fontSize: 14, color: 'rgba(255,255,255,0.6)', display: 'block' },
  moodEmojis: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6 },
  modalBtns: { display: 'flex', gap: 12, marginTop: 8 },
};

export default Dashboard;