import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">تسجيل الدخول</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="كلمة المرور"
            value={form.password}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
        <p className="text-center mt-4">
          ليس لديك حساب؟ <Link to="/register" className="text-blue-600">سجّل الآن</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;