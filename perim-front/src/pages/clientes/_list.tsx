import { useState, useMemo, useEffect } from 'react';
import { useDisclosure } from '@heroui/modal';
import { Card, CardBody } from '@heroui/card';
import { addToast } from '@heroui/toast';

import { deleteClient, deleteEndereco, getClients, postEndereco, putClient, putEndereco } from './_requests';
import { TFormPostClientRes, TFormPostEnderecoRes } from './_types';

import ClientCard from './_clientCards';
import EditClientModal from './_editClientModal';
import DeleteClientModal from './_deleteClientModal';
import SearchBar from './_searchBar';

export interface Endereco extends TFormPostEnderecoRes {
  ehNovo?: boolean;
  remover?: boolean;
}

export interface Cliente extends TFormPostClientRes {
  enderecos: Endereco[];
}

const ListClients = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [clienteEdicao, setClienteEdicao] = useState<Cliente | null>(null);
  const [clienteExclusao, setClienteExclusao] = useState<Cliente | null>(null);
  const [novoEnderecoTemplate, setNovoEnderecoTemplate] = useState<Omit<Endereco, 'id' | 'ehNovo' | 'remover'>>({ 
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cliente: 0,
    principal: false
  });

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const fetchClients = async () => {
    try {
      const res = await getClients();
      setClientes(res.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      addToast({ title: "Erro ao buscar clientes", color: "danger" });
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const clientesFiltrados = useMemo(() => {
    if (!busca) return clientes;
    return clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.cpf.replace(/\D/g, '').includes(busca.replace(/\D/g, ''))
    );
  }, [clientes, busca]);

  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length > 11) return numeros.substring(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length > 11) return numeros.substring(0,11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatarCEP = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length > 8) return numeros.substring(0,8).replace(/(\d{5})(\d{3})/, '$1-$2');
    return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleEdit = (cliente: Cliente) => {
    setClienteEdicao({ ...cliente, enderecos: cliente.enderecos.map(e => ({...e})) });
    onEditOpen();
  };

  const handleDelete = (cliente: Cliente) => {
    setClienteExclusao(cliente);
    onDeleteOpen();
  };

  const confirmarExclusao = async () => {
    if (clienteExclusao) {
      try {
        await deleteClient(clienteExclusao.id);
        setClientes(prev => prev.filter(c => c.id !== clienteExclusao.id));
        addToast({ title: "Cliente excluído com sucesso!", color: "success" });
      } catch (error) {
        addToast({ title: "Erro ao excluir cliente", description: (error as Error).message, color: "danger" });
      } finally {
        setClienteExclusao(null);
        onDeleteClose();
      }
    }
  };
  
  const gerarBulkPromesasEnderecos = async (endereco: Endereco, clientId: number) => {
      if (endereco.ehNovo) {
          const { id, ehNovo, remover, ...enderecoData } = endereco;
          return await postEndereco(clientId, enderecoData as TFormPostEnderecoRes);
      } else if (endereco.remover) {
          return await deleteEndereco(endereco.id, clientId);
      } else {
          const { ehNovo, remover, ...enderecoData } = endereco;
          return await putEndereco(enderecoData as TFormPostEnderecoRes, clientId);
      }
  };

  const salvarEdicao = async () => {
    if (!clienteEdicao) return;

    try {
      const { enderecos, ...clientData } = clienteEdicao;
      const resClient = await putClient(clientData as TFormPostClientRes);
      const clientId = resClient.data.id;

      const promessasDeEnderecos = enderecos.map(async (endereco) => {
        try {
            const enderecoPayload = { ...endereco, cliente: clientId }; 
            const responseEndereco = await gerarBulkPromesasEnderecos(enderecoPayload, clientId);
            return responseEndereco.data; 
        } catch (error) {
            console.error(`Erro ao processar endereço ID: ${endereco.id} para o cliente ID: ${clientId}`, error);
            throw new Error(`Falha ao enviar o endereço: ${(error as Error).message}`);
        }
      });
      
      await Promise.all(promessasDeEnderecos);
      
      addToast({ title: "Cliente editado com sucesso!", color: 'success' });
      setClienteEdicao(null);
      onEditClose();
      fetchClients();
    } catch (e) {
      addToast({ title: "Houve um erro ao salvar o cliente", description: (e as Error).message, color: 'danger' });
    }
  };

  const handleClienteChange = (campo: keyof Cliente, valor: string) => {
    setClienteEdicao(prev => prev ? { ...prev, [campo]: valor } as Cliente : null);
  };

  const handleEnderecoChange = (enderecoId: number, campo: keyof Endereco, valor: string) => {
    setClienteEdicao(prev => {
      if (!prev) return null;
      return {
        ...prev,
        enderecos: prev.enderecos.map(end =>
          end.id === enderecoId ? { ...end, [campo]: valor } : end
        )
      };
    });
  };

  const adicionarEndereco = (idCliente: number) => {
    setClienteEdicao(prev => {
      if (!prev) return null;
      const novoId = Date.now();
      return {
        ...prev,
        enderecos: [...prev.enderecos, { 
            ...novoEnderecoTemplate, 
            id: novoId, 
            cliente: idCliente, 
            ehNovo: true 
        }]
      };
    });
  };

  const removerEndereco = (enderecoId: number) => {
    setClienteEdicao(prev => {
      if (!prev) return null;
      const targetEndereco = prev.enderecos.find(end => end.id === enderecoId);
      if (targetEndereco?.ehNovo) {
        return {
            ...prev,
            enderecos: prev.enderecos.filter(end => end.id !== enderecoId)
        };
      } else {
        return {
            ...prev,
            enderecos: prev.enderecos.map(end =>
              end.id === enderecoId ? { ...end, remover: true } : end
            )
        };
      }
    });
  };

  return (
    <div className="flex h-full grow flex-col">
      <main className="flex flex-1 justify-center">
        <div className="flex flex-col w-full py-5 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <SearchBar
              value={busca}
              onChange={setBusca}
              label="Buscar cliente"
              placeholder="Digite o nome ou CPF do cliente"
              className="w-full max-w-md"
            />
          </div>

          <div className="space-y-4">
            {clientesFiltrados.length === 0 ? (
              <Card className="w-full">
                <CardBody className="p-8 text-center">
                  <p className="text-gray-500">Nenhum cliente encontrado.</p>
                </CardBody>
              </Card>
            ) : (
              clientesFiltrados.map((cliente) => (
                <ClientCard
                  key={cliente.id}
                  cliente={cliente}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {clienteEdicao && (
            <EditClientModal
              isOpen={isEditOpen}
              onClose={() => { onEditClose(); setClienteEdicao(null); }}
              clienteEdicao={clienteEdicao}
              onSave={salvarEdicao}
              onClienteChange={handleClienteChange}
              onEnderecoChange={handleEnderecoChange}
              onAddEndereco={adicionarEndereco}
              onRemoveEndereco={removerEndereco}
              formatarCPF={formatarCPF}
              formatarTelefone={formatarTelefone}
              formatarCEP={formatarCEP}
            />
          )}

          {clienteExclusao && (
            <DeleteClientModal
              isOpen={isDeleteOpen}
              onClose={() => { onDeleteClose(); setClienteExclusao(null); }}
              clienteExclusao={clienteExclusao}
              onConfirm={confirmarExclusao}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ListClients;