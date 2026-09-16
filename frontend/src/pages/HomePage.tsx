import HeroSection from '../components/home/HeroSection';
import CreateRoomCard from '../components/home/CreateRoomCard';
import JoinRoomCard from '../components/home/JoinRoomCard';
import Footer from '../components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <HeroSection />
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pb-16 px-4">
          <CreateRoomCard />
          <JoinRoomCard />
        </div>
      </div>
      <Footer />
    </div>
  );
}
