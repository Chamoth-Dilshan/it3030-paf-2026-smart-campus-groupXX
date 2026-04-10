import MainLayout from "../layouts/MainLayout";
import BookingForm from "../components/forms/BookingForm";

function BookingFormPage() {
  return (
    <MainLayout title="Create Booking">
      <BookingForm />
    </MainLayout>
  );
}

export default BookingFormPage;
