import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Cliente } from './_list';

interface DeleteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteExclusao: Cliente | null;
  onConfirm: () => void;
}

const DeleteClientModal: React.FC<DeleteClientModalProps> = ({ isOpen, onClose, clienteExclusao, onConfirm }) => {
  if (!clienteExclusao) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-semibold text-red-600">Confirmar Exclusão</h2>
        </ModalHeader>
        <ModalBody>
          <p>
            Tem certeza que deseja excluir o cliente <strong>{clienteExclusao.nome}</strong>?
            Esta ação não pode ser desfeita.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="danger" onPress={onConfirm}>
            Excluir Cliente
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteClientModal;