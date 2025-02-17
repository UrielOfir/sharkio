import { AddBox } from "@mui/icons-material";
import { Button, Card } from "@mui/material";
import React, { useEffect, useState } from "react";
import { deleteMock, getAllMocks } from "../../api/api";
import MockRow from "../../components/mock/mock-row";
import { useSnackbar } from "../../hooks/useSnackbar";
import { Mock, ServiceMock } from "../../types/types";
import { AddMockDialog } from "./add-mock-dialog/add-mock.dialog";
import { EditMockDialog } from "./edit-mock-dialog/edit-mock-dialog";
import { useAuthStore } from "../../stores/authStore";

const MocksPage: React.FC = () => {
  const [mocks, setMocks] = useState<ServiceMock[]>([]);
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const { user } = useAuthStore();
  const userId = user?.id;

  const [editMock, setEditMock] = useState<
    (Omit<Mock, "active"> & { port: number }) | null
  >(null);

  const { show: showSnackbar, component: snackBar } = useSnackbar();

  const loadData = () => {
    if (userId == null) {
      showSnackbar("You are not logged in", "error");
      return;
    }
    getAllMocks().then((res) => setMocks(res.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddClicked = () => {
    setAddOpen(true);
  };

  const handleCloseModal = () => {
    setAddOpen(false);
    setEditOpen(false);
    setEditMock(null);
    loadData();
  };

  const handleEditClicked = (mock: Mock, port: number) => {
    setEditOpen(true);
    setEditMock({ ...mock, port });
  };

  const handleDeleteClicked = (id: string, sniffer_id: string) => {
    deleteMock(id, sniffer_id).then(() => {
      showSnackbar("Mock removed successfully", "info");
      loadData();
    });
  };

  return (
    <>
      <div>
        Mocks
        <Button onClick={handleAddClicked}>
          <AddBox />
        </Button>
      </div>
      <Card>
        {mocks.flatMap((serviceMock: ServiceMock) => {
          return serviceMock.mocks.map((mock: Mock) => {
            return (
              <MockRow
                key={mock.id}
                mock={mock}
                service={serviceMock.service}
                loadData={loadData}
                editable={true}
                onEditClick={() =>
                  handleEditClicked(mock, serviceMock.service.port)
                }
                onDeleteClick={() =>
                  handleDeleteClicked(mock.id, serviceMock.service.id)
                }
              />
            );
          });
        })}
      </Card>
      <AddMockDialog open={addOpen} close={handleCloseModal} />
      <EditMockDialog
        mock={editMock!}
        open={editOpen && editMock !== null}
        close={handleCloseModal}
        onDataChange={setEditMock}
      />

      {snackBar}
    </>
  );
};

export default MocksPage;
