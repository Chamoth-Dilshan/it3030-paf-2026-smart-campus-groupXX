import MainLayout from "../layouts/MainLayout";
import PagePlaceholder from "../components/common/PagePlaceholder";

function Dashboard() {
  return (
    <MainLayout title="Dashboard">
      <PagePlaceholder description="Starter dashboard for summaries, quick actions, and upcoming tasks." />
    </MainLayout>
  );
}

export default Dashboard;
