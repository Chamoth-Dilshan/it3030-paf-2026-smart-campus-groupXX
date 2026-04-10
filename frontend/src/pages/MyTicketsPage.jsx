import MainLayout from "../layouts/MainLayout";
import PagePlaceholder from "../components/common/PagePlaceholder";

function MyTicketsPage() {
  return (
    <MainLayout title="My Tickets">
      <PagePlaceholder description="Placeholder page for submitted maintenance and incident tickets." />
    </MainLayout>
  );
}

export default MyTicketsPage;
