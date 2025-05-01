import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";
import { useState } from "react";
import { UserPlus } from 'lucide-react';
import { Button } from './ui/button';

const ModalButton = ({ styles }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base ${styles.buttonPrimary}`}
      >
        <UserPlus className="h-4 w-4" />
        <span className="hidden sm:inline">
          הצטרף כמורה
        </span>
      </Button>
      <SpringModal isOpen={isOpen} setIsOpen={setIsOpen} styles={styles} />
    </>
  );
};

const SpringModal = ({ isOpen, setIsOpen, styles }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="bg-slate-900/20 backdrop-blur py-8 sm:p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0.5, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-blue-600 to-blue-900 text-white p-4 sm:p-6 rounded-lg w-[90%] sm:w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
          >
            <FiAlertCircle className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
            <div className="relative z-10">
              <div className="bg-white w-16 h-16 mb-2 rounded-full text-3xl text-blue-800 grid place-items-center mx-auto">
                <FiAlertCircle />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-center mb-2">
                התחברות
              </h3>
              <p className="text-sm sm:text-base text-center mb-6">
              לא אוהבים רובוטים 😉<br />
כדי למנוע ספאם ולהבטיח קהילה נעימה באתר,<br />
אנחנו משתמשים בהתחברות פשוטה עם גוגל.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-transparent hover:bg-white/10 transition-colors text-white font-semibold w-full py-2 rounded"
                >
                  ביטול
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-white hover:opacity-90 transition-opacity text-blue-800 font-semibold w-full py-2 px-3 sm:px-0 rounded flex items-center justify-center gap-2"
                >
                  <GoogleLogo />
                  התחבר עם גוגל
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const GoogleLogo = () => {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
          />
        </svg>
    );
};

export default ModalButton;