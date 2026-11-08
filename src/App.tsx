import { Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { Navbar } from "@/components/navigation/Navbar"
import { Home } from "@/pages/Home/Home"
import { Roadmaps } from "@/pages/Roadmaps/Roadmaps"
import { RoadmapDetail } from "@/pages/RoadmapDetail/RoadmapDetail"
import { Workspace } from "@/pages/Workspace/Workspace"
import { DatasetExplorer } from "@/pages/DatasetExplorer/DatasetExplorer"
import { Progress } from "@/pages/Progress/Progress"

export default function App() {
  return (
    <Layout>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/roadmaps/:roadmapId" element={<RoadmapDetail />} />
        <Route path="/roadmaps/:roadmapId/workspace" element={<Workspace />} />
        <Route path="/roadmaps/:roadmapId/dataset" element={<DatasetExplorer />} />
        <Route path="/progress" element={<Progress />} />
      </Routes>
    </Layout>
  )
}
