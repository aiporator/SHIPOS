import { Zap, CheckCircle2 } from 'lucide-react';

const BG_IMG = 'https://images.unsplash.com/photo-1633602114554-be8c2c5d6828?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80';

export const LoginBrandPanel = ({ features, de }) => (
  <div data-testid="login-brand-panel" className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMG})` }} />
    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/95" />

    <div className="relative z-10 flex flex-col justify-between p-12 xl:p-20 w-full">
      <div>
        <div className="flex items-center gap-2.5 mb-20">
          <div className="w-10 h-10 rounded-xl bg-[#BFFF00] flex items-center justify-center">
            <Zap size={20} className="text-[#0A0A0A]" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>WLADBOT</span>
        </div>

        <h1 className="text-4xl sm:text-5xl tracking-tighter leading-[1.08] text-white mb-8" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
          {de ? (
            <>Die Zukunft gehört<br /><span className="text-[#BFFF00]">KI-nativen</span><br />Führungskräften.</>
          ) : (
            <>The future belongs to<br /><span className="text-[#BFFF00]">AI-native</span><br />leaders.</>
          )}
        </h1>

        <div className="space-y-5 mt-12">
          {features.map(item => (
            <div key={item.t} className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#BFFF00] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white/80">{item.t}</p>
                <p className="text-xs text-white/30 mt-0.5">{item.s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <p className="text-[11px] text-white/15 tracking-wide">
          {de ? '2.500+ Führungskräfte — von Startups bis DAX.' : '2,500+ leaders — from startups to Fortune 500.'}
        </p>
      </div>
    </div>
  </div>
);
