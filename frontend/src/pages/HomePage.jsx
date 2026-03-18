import { Link } from 'react-router-dom';
import {
  HiOutlineChartBar,
  HiOutlineCurrencyRupee,
  HiOutlineClipboardCheck,
  HiOutlineStar,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
} from 'react-icons/hi';

export default function HomePage() {
  return (
    <div className='min-h-screen bg-white dark:bg-dark-950 transition-colors duration-300 selection:bg-primary-500/30'>
      {/* Header */}
      <header className='fixed top-0 left-0 right-0 z-50 h-20 bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-dark-800'>
        <div className='max-w-7xl mx-auto px-6 h-full flex items-center justify-between'>
          <div className='flex items-center gap-2 group'>
            <span className='text-3xl'>🍛</span>
            <span className='text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent'>
              MessWala
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <Link
              to='/login'
              className='text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
            >
              Log In
            </Link>
            <Link
              to='/login'
              className='btn-primary py-2 px-5 text-sm shadow-lg shadow-primary-500/20'
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className='pt-32 pb-16 px-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center max-w-4xl mx-auto mb-20 animate-slide-up'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 font-medium text-sm mb-8 border border-primary-100 dark:border-primary-900/30'>
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-primary-500'></span>
              </span>
              Open Source Hostel Mess Management
            </div>
            <h1 className='text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6'>
              Smart logistics for your <br className='hidden md:block' />
              <span className='bg-gradient-to-r from-primary-500 via-orange-500 to-primary-600 bg-clip-text text-transparent'>
                hostel mess.
              </span>
            </h1>
            <p className='text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed'>
              Bring transparency, accountability, and data-driven intelligence to your hostel mess.
              Track expenses, predict costs, and manage attendance without the spreadsheets.
            </p>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <Link
                to='/login'
                className='w-full sm:w-auto btn-primary py-3.5 px-8 text-base shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2 group'
              >
                Get Started
                <HiOutlineArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </Link>
              <Link
                to='/login'
                className='w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-all text-base border border-transparent dark:border-dark-700 flex items-center justify-center'
              >
                View Demo
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16 animate-slide-up'
            style={{ animationDelay: '200ms' }}
          >
            {[
              {
                icon: HiOutlineCurrencyRupee,
                title: 'Live Cost Tracking',
                desc: 'Monitor daily, weekly, and monthly expenses. See real-time cost-per-plate calculations instantly.',
                color: 'text-emerald-500',
                bg: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30',
              },
              {
                icon: HiOutlineChartBar,
                title: 'Predictive Analytics',
                desc: "Uses linear regression on historical attendance and expense data to forecast next month's budget.",
                color: 'text-violet-500',
                bg: 'bg-violet-50 dark:bg-violet-900/10 border-violet-100 dark:border-violet-900/30',
              },
              {
                icon: HiOutlineClipboardCheck,
                title: 'Digital Attendance',
                desc: 'Students can effortlessly mark meals or opt-out. Managers get accurate daily headcount predictions.',
                color: 'text-blue-500',
                bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30',
              },
              {
                icon: HiOutlineStar,
                title: 'Feedback Loop',
                desc: 'Daily anonymous meal ratings. Track satisfaction trends and identify the most complained-about dishes.',
                color: 'text-amber-500',
                bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30',
              },
              {
                icon: HiOutlineShieldCheck,
                title: 'Transparency Index',
                desc: 'A unique trust score based on how frequently logs are updated and how accurately attendance is tracked.',
                color: 'text-primary-500',
                bg: 'bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30',
              },
            ].map((feat, i) => (
              <div
                key={i}
                className={`p-8 rounded-3xl border ${feat.bg} transition-transform hover:-translate-y-1 duration-300`}
              >
                <feat.icon className={`w-10 h-10 ${feat.color} mb-5`} />
                <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-3'>
                  {feat.title}
                </h3>
                <p className='text-gray-500 dark:text-gray-400 leading-relaxed'>{feat.desc}</p>
              </div>
            ))}

            {/* FOSS Callout */}
            <div className='p-8 rounded-3xl bg-gray-900 dark:bg-black border border-gray-800 flex flex-col justify-center items-start text-left min-h-[250px] relative overflow-hidden group'>
              <div className='absolute top-0 right-0 p-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-500/20 transition-all duration-700'></div>
              <h3 className='text-2xl font-bold text-white mb-3 relative z-10'>
                100% Free & Open Source
              </h3>
              <p className='text-gray-400 mb-6 relative z-10'>
                Built with React, Node, and MongoDB. Own your mess data forever.
              </p>
              <a
                href='https://github.com/soumyadeepsarkar-2004/MessWala'
                target='_blank'
                rel='noreferrer'
                className='text-primary-400 font-semibold flex items-center gap-2 hover:text-primary-300 transition-colors relative z-10'
              >
                View source code <HiOutlineArrowRight className='w-4 h-4' />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='border-t border-gray-100 dark:border-dark-800 py-10 mt-10'>
        <div className='max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-xl'>🍛</span>
            <span className='font-bold text-gray-900 dark:text-white'>MessWala</span>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Made with ❤️ for hostel students everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
