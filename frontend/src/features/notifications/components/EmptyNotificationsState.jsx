import { motion as Motion } from 'framer-motion';
import { BellOff } from 'lucide-react';

const EmptyNotificationsState = () => (
  <Motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white/40 backdrop-blur-3xl border-2 border-dashed border-slate-200 rounded-[4rem] py-40 text-center"
  >
    <BellOff className="mx-auto text-slate-200 mb-8" size={80} />
    <h3 className="text-3xl font-prestige text-slate-800">Operational Silence</h3>
    <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto">
      No institutional alerts have been broadcasted to your node in the current session.
    </p>
  </Motion.div>
);

export default EmptyNotificationsState;
