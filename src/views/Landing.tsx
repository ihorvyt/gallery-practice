import { motion } from 'motion/react';
import { Camera, Shield, FolderTree, Share2, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export const LandingPage = ({ onStart, onLogin, onRegister }: LandingPageProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between glass sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Camera size={24} />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">Lumina</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onLogin} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            Увійти
          </button>
          <button onClick={onRegister} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            Зареєструватися
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="px-6 py-20 md:py-32 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 mb-6 leading-tight">
              Ваші спогади, <br />
              <span className="text-indigo-600">красиво організовані.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              Lumina — це сучасний простір для ваших фотографій. Завантажуйте, створюйте папки та діліться моментами з близькими.
            </p>
            <button
              onClick={onStart}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-lg font-semibold hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 flex items-center gap-2 mx-auto group"
            >
              Почати безкоштовно
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </section>

        {/* Features */}
        <section className="px-6 py-20 bg-slate-100">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-center mb-16">Все, що вам потрібно</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Camera />, title: "Швидке завантаження", desc: "Завантажуйте сотні фотографій миттєво за допомогою Drag & Drop." },
                { icon: <FolderTree />, title: "Розумні папки", desc: "Створюйте вкладені папки для ідеального порядку у вашій бібліотеці." },
                { icon: <Shield />, title: "Безпека", desc: "Ваші дані зашифровані та доступні тільки вам" }
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-white rounded-3xl shadow-sm border border-slate-200"
                >
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-slate-600">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Camera size={20} />
            <span className="font-display font-bold">Lumina</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-indigo-600">Контакти</a>
            <a href="#" className="hover:text-indigo-600">Політика конфіденційності</a>
          </div>
          <div className="text-sm text-slate-400">
            © {new Date().getFullYear()} Lumina. Всі права захищені.
          </div>
        </div>
      </footer>
    </div>
  );
};
