import MainLayout from "../layouts/MainLayout";
import PagePlaceholder from "../components/common/PagePlaceholder";

function MyBookingsPage() {
  return (
    <MainLayout title="My Bookings">
      <PagePlaceholder description="Placeholder page for a user's booking history and upcoming reservations." />
    </MainLayout>
  );
}

export default MyBookingsPage;
