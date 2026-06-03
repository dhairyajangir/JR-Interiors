// App Router re-mounts this on every navigation, giving each route a
// subtle entrance animation (see .page-enter in globals.css).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
