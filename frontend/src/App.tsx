import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { StoriesPage } from "./pages/StoriesPage.tsx";
import { ContributorsPage } from "./pages/ContributorsPage.tsx";
import { CreateStoryPage } from "./pages/CreateStoryPage.tsx";
import { StoryPage } from "./pages/StoryPage.tsx";
import { ContributeToStoryPage } from "./pages/ContributeToStoryPage.tsx";
import { ProfilePage } from "./pages/ProfilePage.tsx";
import { RewardsPage } from "./pages/RewardsPage.tsx";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/contributors" element={<ContributorsPage />} />
        <Route path="/create" element={<CreateStoryPage />} />
        <Route path="/story/:id" element={<StoryPage />} />
        <Route
          path="/story/:id/contribute"
          element={<ContributeToStoryPage />}
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/rewards" element={<RewardsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
