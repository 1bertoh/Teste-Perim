import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Divider } from '@heroui/divider';
import { Card, CardBody } from '@heroui/card';
import { Cliente, Endereco } from './_list';
interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteEdicao: Cliente | null;
  onSave: () => void;
  onClienteChange: (campo: keyof Cliente, valor: string) => void;
  onEnderecoChange: (enderecoId: number, campo: keyof Endereco, valor: string) => void;
  onAddEndereco: (clienteId: number) => void;
  onRemoveEndereco: (enderecoId: number) => void;
  formatarCPF: (valor: string) => string;
  formatarTelefone: (valor: string) => string;
  formatarCEP: (valor: string) => string;
}

const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  onClose,
  clienteEdicao,
  onSave,
  onClienteChange,
  onEnderecoChange,
  onAddEndereco,
  onRemoveEndereco,
  formatarCPF,
  formatarTelefone,
  formatarCEP,
}) => {
  if (!clienteEdicao) return null;

  const visibleEnderecos = clienteEdicao.enderecos.filter(end => !end.remover);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-semibold">Editar Cliente</h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Dados Pessoais</h3>
              <div className="space-y-4">
                <Input
                  value={clienteEdicao.nome}
                  onChange={(e) => onClienteChange('nome', e.target.value)}
                  label="Nome completo"
                  variant="bordered"
                  fullWidth
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    value={clienteEdicao.cpf}
                    onChange={(e) => onClienteChange('cpf', formatarCPF(e.target.value))}
                    label="CPF"
                    variant="bordered"
                    className="flex-1"
                  />
                  <Input
                    value={clienteEdicao.telefone}
                    onChange={(e) => onClienteChange('telefone', formatarTelefone(e.target.value))}
                    label="Telefone"
                    variant="bordered"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <Divider />

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Endereços</h3>
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  onPress={() => onAddEndereco(clienteEdicao.id)}
                >
                  + Adicionar Endereço
                </Button>
              </div>
              <div className="space-y-4">
                {clienteEdicao.enderecos.map((endereco) => (
                  !endereco.remover && (
                    <Card key={endereco.id}>
                      <CardBody className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Endereço {visibleEnderecos.findIndex(e => e.id === endereco.id) + 1}</span>
                          {visibleEnderecos.length > 1 && (
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              onPress={() => onRemoveEndereco(endereco.id)}
                            >
                              Remover
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <Input
                            value={endereco.cep}
                            onChange={(e) => onEnderecoChange(endereco.id, 'cep', formatarCEP(e.target.value))}
                            label="CEP"
                            size="sm"
                            variant="bordered"
                          />
                          <Input
                            value={endereco.logradouro}
                            onChange={(e) => onEnderecoChange(endereco.id, 'logradouro', e.target.value)}
                            label="Logradouro"
                            size="sm"
                            variant="bordered"
                            className="md:col-span-2"
                          />
                          <Input
                            value={endereco.numero}
                            onChange={(e) => onEnderecoChange(endereco.id, 'numero', e.target.value)}
                            label="Número"
                            size="sm"
                            variant="bordered"
                          />
                          <Input
                            value={endereco.complemento}
                            onChange={(e) => onEnderecoChange(endereco.id, 'complemento', e.target.value)}
                            label="Complemento"
                            size="sm"
                            variant="bordered"
                            className="md:col-span-2"
                          />
                          <Input
                            value={endereco.bairro}
                            onChange={(e) => onEnderecoChange(endereco.id, 'bairro', e.target.value)}
                            label="Bairro"
                            size="sm"
                            variant="bordered"
                          />
                          <Input
                            value={endereco.cidade}
                            onChange={(e) => onEnderecoChange(endereco.id, 'cidade', e.target.value)}
                            label="Cidade"
                            size="sm"
                            variant="bordered"
                          />
                          <Input
                            value={endereco.estado}
                            onChange={(e) => onEnderecoChange(endereco.id, 'estado', e.target.value.toUpperCase())}
                            label="Estado"
                            size="sm"
                            variant="bordered"
                            maxLength={2}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  )
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" onPress={onSave}>
            Salvar Alterações
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditClientModal;