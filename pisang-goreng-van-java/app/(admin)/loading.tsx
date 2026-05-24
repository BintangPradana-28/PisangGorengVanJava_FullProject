export default function AdminLoading() {
  return (
    <div className="flex-1 p-6 sm:p-8 bg-cream-100 flex flex-col justify-center items-center h-full min-h-screen">
      <div className="flex flex-col items-center">
        {/* Animated Loading Spinner */}
        <div className="w-16 h-16 border-4 border-brown-700/20 border-t-brown-700 rounded-full animate-spin mb-6"></div>
        
        <h2 className="font-serif text-2xl font-bold text-brown-700 mb-2">Memuat Data...</h2>
        <p className="text-brown-500/70 text-sm">Harap tunggu sebentar</p>
      </div>
    </div>
  );
}
