import React from 'react';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';
import { Pen, Trash } from 'lucide-react';
import { Cliente } from './_list';

interface ClientCardProps {
  cliente: Cliente;
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ cliente, onEdit, onDelete }) => {
  return (
    <Card className="w-full">
      <CardBody className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{cliente.nome}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <span><strong>CPF:</strong> {cliente.cpf}</span>
              <span><strong>Telefone:</strong> {cliente.telefone}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {cliente.enderecos.filter(end => !end.remover).map((endereco) => (
                <Chip key={endereco.id} size="sm" variant="flat" color="primary">
                  {endereco.logradouro}, {endereco.numero} - {endereco.bairro}
                </Chip>
              ))}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              color="primary"
              variant="light"
              onPress={() => onEdit(cliente)}
              aria-label={`Editar ${cliente.nome}`}
            >
              <Pen />
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="light"
              onPress={() => onDelete(cliente)}
              aria-label={`Excluir ${cliente.nome}`}
            >
              <Trash />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ClientCard;