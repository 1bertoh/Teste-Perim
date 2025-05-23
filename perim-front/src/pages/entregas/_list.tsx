import { useState, useMemo, useEffect } from 'react';
import { Input } from "@heroui/input";
import { Button, ButtonGroup } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { useDisclosure } from '@heroui/modal';
import { Chip } from '@heroui/chip';
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/date-picker";
import { Checkbox } from "@heroui/checkbox";
import { getEntregas, putEntrega } from './_requests';
import { EntregaRes as Entrega } from './_type';
import axios from 'axios';
import { parseZonedDateTime } from '@internationalized/date';
import { addToast } from '@heroui/toast';
import { Eye, Pen, Trash } from 'lucide-react';

export interface TFormPostEndereco {
    id: number;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    principal: boolean;
}

interface ClienteComEnderecos {
    id: number;
    nome: string;
    enderecos: TFormPostEndereco[];
}

const resetEntrega: Entrega = {
    cliente: 0,
    endereco: 0,
    numero_caixas: 0,
    entregador: {
        id: 0,
        nome: '',
        created_at: '',
        updated_at: ''
    },
    bebidas: false,
    frios_congelados: false,
    vassoura_rodo: false,
    outros: false,
    data_compra: '',
    data_hora_entrega: '',
    nome_embalador: 'Teste',
    numero_nfce: '',
    serie_nfce: '',
    cliente_nome: "",
    created_at: '',
    endereco_detalhes: {
        bairro: "",
        cep: "",
        cidade: "",
        cliente: 0,
        complemento: "",
        estado: "",
        id: 0,
        logradouro: "",
        numero: "",
        principal: false
    },
    entregador_id: 0,
    id: 0,
    status: 'pendente',
    updated_at: ''
}

const STATUS_CONFIG = {
    pendente: { label: 'Pendente', color: 'warning' as const },
    em_transito: { label: 'Em Trânsito', color: 'primary' as const },
    entregue: { label: 'Entregue', color: 'success' as const }
};

const DeliveryList = () => {
    const [entregas, setEntregas] = useState<Entrega[]>([]);

    const [clienteEnderecos, setClienteEnderecos] = useState<TFormPostEndereco[]>([]);
    const [loadingClienteEnderecos, setLoadingClienteEnderecos] = useState(false);

    const [filtros, setFiltros] = useState({
        cliente: '',
        status: '',
        dataInicio: '',
        dataFim: ''
    });

    const [entregaDetalhes, setEntregaDetalhes] = useState<Entrega>(resetEntrega);
    const [entregaEdicao, setEntregaEdicao] = useState<Entrega>(resetEntrega);
    const [entregaExclusao, setEntregaExclusao] = useState<Entrega>(resetEntrega);

    const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    const handleDataEntregaChange = (date: Date | undefined) => {
        console.log(date, 'ai apapai')
        if (!date) return;

        const simpleDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        setEntregaEdicao(prev => ({
            ...prev,
            data_compra: simpleDate,
            data_hora_entrega: date.toISOString()
        }));
    };

    const entregasFiltradas = useMemo(() => {
        return entregas.filter(entrega => {
            const matchCliente = !filtros.cliente ||
                entrega.cliente_nome.toLowerCase().includes(filtros.cliente.toLowerCase());

            const matchStatus = !filtros.status || entrega.status === filtros.status;

            const dataEntrega = new Date(entrega.data_hora_entrega);
            const matchDataInicio = !filtros.dataInicio ||
                dataEntrega >= new Date(filtros.dataInicio);
            const matchDataFim = !filtros.dataFim ||
                dataEntrega <= new Date(filtros.dataFim);

            return matchCliente && matchStatus && matchDataInicio && matchDataFim;
        });
    }, [entregas, filtros]);

    const handleFiltroChange = (campo: string, valor: string) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    useEffect(() => {
        const fetch = async () => {
            const res = await getEntregas()
            setEntregas(res.data)
        }
        fetch()
    }, [])

    const buscarEnderecosCliente = async (clienteId: number) => {
        setLoadingClienteEnderecos(true);
        try {
            const response = await axios.get<ClienteComEnderecos>(`http://127.0.0.1:8000/api/clientes/${clienteId}`);
            setClienteEnderecos(response.data.enderecos);
        } catch (error) {
            console.error('Erro ao buscar endereços do cliente:', error);
            setClienteEnderecos([]);
        } finally {
            setLoadingClienteEnderecos(false);
        }
    };

    const limparFiltros = () => {
        setFiltros({
            cliente: '',
            status: '',
            dataInicio: '',
            dataFim: ''
        });
    };

    const handleDetails = (entrega: Entrega) => {
        setEntregaDetalhes(entrega);
        onDetailsOpen();
    };

    const handleEdit = async (entrega: Entrega) => {
        setEntregaEdicao({ ...entrega });

        if (entrega.cliente) {
            await buscarEnderecosCliente(entrega.cliente);
        }

        onEditOpen();
    };

    const handleDelete = (entrega: Entrega) => {
        setEntregaExclusao(entrega);
        onDeleteOpen();
    };

    const confirmarExclusao = () => {
        if (entregaExclusao) {
            setEntregas(prev => prev.filter(e => e.id !== entregaExclusao.id));
            setEntregaExclusao(resetEntrega);
            onDeleteClose();
        }
    };

    const salvarEdicao = async () => {
        if (entregaEdicao) {
            try {
                await putEntrega(entregaEdicao);
                addToast({
                    title: "Entrega editada com sucesso!",
                    color: "success"
                })
                setEntregas(prev => prev.map(e => e.id === entregaEdicao.id ? entregaEdicao : e));
                setEntregaEdicao(resetEntrega);
                onEditClose();
            } catch (e) {
                addToast({
                    title: "Erro ao editar a entrega!",
                    color: "danger"
                })
            }
        }
    };

    const handleEntregaChange = (campo: string, valor: any) => {
        if (entregaEdicao) {
            setEntregaEdicao(prev => prev ? { ...prev, [campo]: valor } : resetEntrega);
        }
    };

    const handleEnderecoChange = (enderecoId: string) => {
        if (entregaEdicao && enderecoId) {
            const enderecoSelecionado = clienteEnderecos.find(end => end.id.toString() === enderecoId);
            if (enderecoSelecionado) {
                setEntregaEdicao(prev => prev ? {
                    ...prev,
                    endereco: enderecoSelecionado.id,
                } : resetEntrega);
            }
        }
    };

    const handleVolumeExtraChange = (campo: string, checked: boolean) => {
        if (entregaEdicao) {
            setEntregaEdicao(prev => prev ? {
                ...prev,
                [campo]: checked
            } : resetEntrega);
        }
    };

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const formatarDataHora = (dataHora: string) => {
        return new Date(dataHora).toLocaleString('pt-BR');
    };

    const getVolumesExtrasTexto = (volumes: Entrega) => {
        const ativos = [];
        if (volumes.bebidas) ativos.push('Bebidas');
        if (volumes.frios_congelados) ativos.push('Frios/Congelados');
        if (volumes.vassoura_rodo) ativos.push('Vassouras/Rodo');
        if (volumes.outros) ativos.push('Outros');
        return ativos.length > 0 ? ativos.join(', ') : 'Nenhum';
    };

    const formatarEnderecoCompleto = (endereco: TFormPostEndereco) => {
        const complemento = endereco.complemento ? `, ${endereco.complemento}` : '';
        return `${endereco.logradouro}, ${endereco.numero}${complemento} - ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}`;
    };

    const handleEditClose = () => {
        setClienteEnderecos([]);
        setEntregaEdicao(resetEntrega);
        onEditClose();
    };

    return (
        <div className="flex h-full grow flex-col">
            <main className="flex flex-1 justify-center">
                <div className="flex flex-col w-full py-5">

                    <Card className="mb-6">
                        <CardBody className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Filtros</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <Input
                                    value={filtros.cliente}
                                    onChange={(e) => handleFiltroChange('cliente', e.target.value)}
                                    label="Cliente"
                                    placeholder="Buscar por cliente"
                                    variant="bordered"
                                />
                                <Select
                                    label="Status"
                                    placeholder="Todos os status"
                                    variant="bordered"
                                    selectedKeys={filtros.status ? [filtros.status] : []}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        handleFiltroChange('status', selected || '');
                                    }}
                                >
                                    <SelectItem key="pendente">Pendente</SelectItem>
                                    <SelectItem key="em_transito">Em Trânsito</SelectItem>
                                    <SelectItem key="entregue">Entregue</SelectItem>
                                </Select>
                                <Input
                                    type="date"
                                    value={filtros.dataInicio}
                                    onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                                    label="Data início"
                                    variant="bordered"
                                />
                                <Input
                                    type="date"
                                    value={filtros.dataFim}
                                    onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                                    label="Data fim"
                                    variant="bordered"
                                />
                            </div>
                            <Button
                                size="sm"
                                variant="flat"
                                onPress={limparFiltros}
                            >
                                Limpar Filtros
                            </Button>
                        </CardBody>
                    </Card>

                    <div className="space-y-4">
                        {entregasFiltradas.length === 0 ? (
                            <Card className="w-full">
                                <CardBody className="p-8 text-center">
                                    <p className="text-gray-500">Nenhuma entrega encontrada.</p>
                                </CardBody>
                            </Card>
                        ) : (
                            entregasFiltradas.map((entrega) => (
                                <Card key={entrega.id} className="w-full">
                                    <CardBody className="p-6 mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between gap-3 mb-2">
                                                <div className='flex gap-3 items-center'>
                                                    <h3 className="text-xl font-semibold text-gray-900">{entrega.cliente_nome}</h3>
                                                    <Chip
                                                        size="sm"
                                                        color={STATUS_CONFIG[entrega.status].color}
                                                        variant="flat"
                                                    >
                                                        {STATUS_CONFIG[entrega.status].label}
                                                    </Chip>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    <ButtonGroup>
                                                        <Button
                                                            size="sm"
                                                            color="secondary"
                                                            variant="light"
                                                            onPress={() => handleDetails(entrega)}
                                                        >
                                                            <Eye/>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            color="primary"
                                                            variant="light"
                                                            onPress={() => handleEdit(entrega)}
                                                        >
                                                            <Pen/>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            color="danger"
                                                            variant="light"
                                                            onPress={() => handleDelete(entrega)}
                                                        >
                                                            <Trash/>
                                                        </Button>
                                                    </ButtonGroup>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                                <span><strong>Endereço:</strong> {entrega.endereco_detalhes.bairro},{entrega.endereco_detalhes.logradouro}, {entrega.endereco_detalhes.numero}</span>
                                                <span><strong>Caixas:</strong> {entrega.numero_caixas}</span>
                                                <span><strong>Entregador:</strong> {entrega.entregador.nome}</span>
                                                <span><strong>NFCe:</strong> {entrega.numero_nfce}/{entrega.serie_nfce}</span>
                                                <span><strong>Compra:</strong> {formatarData(entrega.data_compra)}</span>
                                                <span><strong>Entrega:</strong> {formatarDataHora(entrega.data_hora_entrega)}</span>
                                            </div>
                                            {getVolumesExtrasTexto(entrega) !== 'Nenhum' && (
                                                <div className="text-sm text-gray-600">
                                                    <strong>Volumes extras:</strong> {getVolumesExtrasTexto(entrega)}
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            ))
                        )}
                    </div>

                    <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="3xl">
                        <ModalContent>
                            <ModalHeader>
                                <h2 className="text-xl font-semibold">Detalhes da Entrega</h2>
                            </ModalHeader>
                            <ModalBody>
                                {entregaDetalhes && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="font-medium text-gray-900">Cliente</p>
                                                <p className="text-gray-600">{entregaDetalhes.cliente_nome}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Status</p>
                                                <Chip
                                                    size="sm"
                                                    color={STATUS_CONFIG[entregaDetalhes.status].color}
                                                    variant="flat"
                                                >
                                                    {STATUS_CONFIG[entregaDetalhes.status].label}
                                                </Chip>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="font-medium text-gray-900">Endereço</p>
                                                <p className="text-gray-600">{entregaDetalhes.endereco_detalhes.bairro}, {entregaDetalhes.endereco_detalhes.logradouro}, {entregaDetalhes.endereco_detalhes.numero}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Número de Caixas</p>
                                                <p className="text-gray-600">{entregaDetalhes.numero_caixas}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Entregador</p>
                                                <p className="text-gray-600">{entregaDetalhes.entregador.nome}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">NFCe</p>
                                                <p className="text-gray-600">{entregaDetalhes.numero_nfce}/{entregaDetalhes.serie_nfce}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Data da Compra</p>
                                                <p className="text-gray-600">{formatarData(entregaDetalhes.data_compra)}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Data/Hora da Entrega</p>
                                                <p className="text-gray-600">{formatarDataHora(entregaDetalhes.data_hora_entrega)}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Criado em</p>
                                                <p className="text-gray-600">{formatarDataHora(entregaDetalhes.created_at)}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="font-medium text-gray-900">Volumes Extras</p>
                                                <p className="text-gray-600">{getVolumesExtrasTexto(entregaDetalhes)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button onPress={onDetailsClose}>
                                    Fechar
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    <Modal isOpen={isEditOpen} onClose={handleEditClose} size="4xl" scrollBehavior="inside">
                        <ModalContent>
                            <ModalHeader>
                                <h2 className="text-xl font-semibold">Editar Entrega</h2>
                            </ModalHeader>
                            <ModalBody>
                                {entregaEdicao && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                value={entregaEdicao.cliente_nome}
                                                onChange={(e) => handleEntregaChange('cliente_nome', e.target.value)}
                                                label="Cliente"
                                                variant="bordered"
                                                isReadOnly
                                            />
                                            <Select
                                                label="Status"
                                                variant="bordered"
                                                selectedKeys={[entregaEdicao.status]}
                                                onSelectionChange={(keys) => {
                                                    const selected = Array.from(keys)[0] as string;
                                                    handleEntregaChange('status', selected);
                                                }}
                                            >
                                                <SelectItem key="pendente">Pendente</SelectItem>
                                                <SelectItem key="em_transito">Em Trânsito</SelectItem>
                                                <SelectItem key="entregue">Entregue</SelectItem>
                                            </Select>

                                            <Select
                                                label="Endereço"
                                                placeholder={loadingClienteEnderecos ? "Carregando endereços..." : "Selecione um endereço"}
                                                variant="bordered"
                                                className="md:col-span-2"
                                                isLoading={loadingClienteEnderecos}
                                                selectedKeys={entregaEdicao.endereco ? [entregaEdicao.endereco.toString()] : []}
                                                onSelectionChange={(keys) => {
                                                    const selected = Array.from(keys)[0] as string;
                                                    handleEnderecoChange(selected);
                                                }}
                                            >
                                                {clienteEnderecos.map((endereco) => (
                                                    <SelectItem key={endereco.id.toString()}>
                                                        {`${formatarEnderecoCompleto(endereco)} ${endereco.principal && " (Principal)"}`}
                                                    </SelectItem>
                                                ))}
                                            </Select>

                                            <Input
                                                type="number"
                                                value={entregaEdicao.numero_caixas.toString()}
                                                onChange={(e) => handleEntregaChange('numero_caixas', parseInt(e.target.value))}
                                                label="Número de Caixas"
                                                variant="bordered"
                                                min="1"
                                            />
                                            <Input
                                                value={entregaEdicao.nome_embalador}
                                                onChange={(e) => handleEntregaChange('nome_embalador', e.target.value)}
                                                label="Nome do Embalador"
                                                variant="bordered"
                                            />
                                            <Input
                                                value={entregaEdicao.numero_nfce}
                                                onChange={(e) => handleEntregaChange('numero_nfce', e.target.value)}
                                                label="Número da NFCe"
                                                variant="bordered"
                                            />
                                            <Input
                                                value={entregaEdicao.serie_nfce}
                                                onChange={(e) => handleEntregaChange('serie_nfce', e.target.value)}
                                                label="Série da NFCe"
                                                variant="bordered"
                                            />
                                            <DatePicker
                                                defaultValue={entregaEdicao.data_hora_entrega ? parseZonedDateTime(entregaEdicao.data_hora_entrega.replace('Z', '') + "[America/Sao_Paulo]") : undefined}

                                                className="w-full"
                                                granularity="second"
                                                label="Data/Hora da Entrega"
                                                onChange={(e) => handleDataEntregaChange(e?.toDate())}
                                            />
                                        </div>

                                        <div>
                                            <p className="text-gray-900 text-sm font-medium leading-normal pb-3">Volumes Extras</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Checkbox
                                                    color='success'
                                                    isSelected={entregaEdicao.bebidas}
                                                    onValueChange={(checked) => handleVolumeExtraChange('bebidas', checked)}
                                                >
                                                    Bebidas
                                                </Checkbox>
                                                <Checkbox
                                                    color='success'
                                                    isSelected={entregaEdicao.frios_congelados}
                                                    onValueChange={(checked) => handleVolumeExtraChange('frios_congelados', checked)}
                                                >
                                                    Frios/Congelados
                                                </Checkbox>
                                                <Checkbox
                                                    color='success'
                                                    isSelected={entregaEdicao.vassoura_rodo}
                                                    onValueChange={(checked) => handleVolumeExtraChange('vassoura_rodo', checked)}
                                                >
                                                    Vassouras/Rodo
                                                </Checkbox>
                                                <Checkbox
                                                    color='success'
                                                    isSelected={entregaEdicao.outros}
                                                    onValueChange={(checked) => handleVolumeExtraChange('outros', checked)}
                                                >
                                                    Outros
                                                </Checkbox>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={handleEditClose}>
                                    Cancelar
                                </Button>
                                <Button className='bg-[#45e519] font-bold' onPress={salvarEdicao}>
                                    Salvar Alterações
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                        <ModalContent>
                            <ModalHeader>
                                <h2 className="text-xl font-semibold text-red-600">Confirmar Exclusão</h2>
                            </ModalHeader>
                            <ModalBody>
                                {entregaExclusao && (
                                    <p>
                                        Tem certeza que deseja excluir a entrega para <strong>{entregaExclusao.cliente_nome}</strong>?
                                        Esta ação não pode ser desfeita.
                                    </p>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onDeleteClose}>
                                    Cancelar
                                </Button>
                                <Button color="danger" onPress={confirmarExclusao}>
                                    Excluir Entrega
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </div>
            </main>
        </div>
    );
};

export default DeliveryList;