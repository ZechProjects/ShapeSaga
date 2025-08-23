import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ExplorePage } from "./pages/ExplorePage";
import { CreateStoryPage } from "./pages/CreateStoryPage";
import { StoryPage } from "./pages/StoryPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RewardsPage } from "./pages/RewardsPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/create" element={<CreateStoryPage />} />
        <Route path="/story/:id" element={<StoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/rewards" element={<RewardsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
