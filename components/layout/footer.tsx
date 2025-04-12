export function Footer() {
  return (
    <footer className="mt-16 py-6 bg-gradient-to-b from-transparent to-black/40 backdrop-blur-sm border-t border-[#333]/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-sm text-gray-400">
            Desenvolvido com <span className="text-[var(--team-primary)]">♥</span> por
          </p>
          <a
            href="https://ialexanderbrito.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-md font-medium text-white hover:text-[var(--team-primary)] transition-colors group flex items-center gap-1.5"
          >
            ialexanderbrito
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
            >
              <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
            </svg>
          </a>
          <p className="mt-3 text-xs text-gray-500">© {new Date().getFullYear()} Kings League Simulator</p>
        </div>
      </div>
    </footer>
  )
}