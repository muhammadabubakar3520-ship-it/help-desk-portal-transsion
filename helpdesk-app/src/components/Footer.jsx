export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-4 text-xs text-slate-500 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <span>&copy; {new Date().getFullYear()} TRANSSION HOLDINGS. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-brand-primary">System Status</a>
          <a href="#" className="hover:text-brand-primary">IT Support</a>
          <a href="#" className="hover:text-brand-primary">Privacy Policy</a>
        </div>
      </div>
    </footer>
  )
}
