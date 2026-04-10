import MainLayout from "../layouts/MainLayout";
import TicketForm from "../components/forms/TicketForm";

function CreateTicketPage() {
  return (
    <MainLayout title="Create Ticket">
      <TicketForm />
    </MainLayout>
  );
}

export default CreateTicketPage;
