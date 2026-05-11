const AdminLayout = ({ children }) => (
  <div className="d-flex">
    {/* Sidebar Fixed */}
    <Sidebar />
    
    {/* Main Content Area */}
    <div className="flex-grow-1" style={{ marginLeft: '260px' }}>
      <Navbar />
      <main className="p-0">
        {children}
      </main>
    </div>
  </div>
);