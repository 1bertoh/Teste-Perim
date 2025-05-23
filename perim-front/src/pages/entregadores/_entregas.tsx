import { useMemo, useState } from "react";
import { Entrega, Entregador, STATUS_CONFIG } from "./_types";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/modal";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { ArrowLeft, Package, User } from "lucide-react";
import { Chip } from "@heroui/chip";

type props = {
    entregador: Entregador;
    entregas: Entrega[];
    onBack: () => void;
}

const EntregasEntregador = (props: props) => {
    const {entregador, entregas, onBack} = props
    const [filtroStatus, setFiltroStatus] = useState('');
    const [entregaDetalhes, setEntregaDetalhes] = useState<Entrega | null>(null);
    const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

    const entregasDoEntregador = useMemo(() => {
        const entregasFiltradas = entregas.filter(e => e.nomeEntregador === entregador.nome);
        
        if (filtroStatus) {
            return entregasFiltradas.filter(e => e.status === filtroStatus);
        }
        
        return entregasFiltradas;
    }, [entregas, entregador.nome, filtroStatus]);

    const handleDetails = (entrega: Entrega) => {
        setEntregaDetalhes(entrega);
        onDetailsOpen();
    };

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const formatarDataHora = (dataHora: string) => {
        return new Date(dataHora).toLocaleString('pt-BR');
    };

    const getVolumesExtrasTexto = (volumes: Entrega['volumesExtras']) => {
        const ativos = [];
        if (volumes.bebidas) ativos.push('Bebidas');
        if (volumes.friosCongelados) ativos.push('Frios/Congelados');
        if (volumes.vassouraRodo) ativos.push('Vassouras/Rodo');
        if (volumes.outros) ativos.push('Outros');
        return ativos.length > 0 ? ativos.join(', ') : 'Nenhum';
    };

    const statusCounts = useMemo(() => {
        const counts = { pendente: 0, em_transito: 0, entregue: 0 };
        entregas.filter(e => e.nomeEntregador === entregador.nome).forEach(e => {
            counts[e.status]++;
        });
        return counts;
    }, [entregas, entregador.nome]);

    return (
        <>
            <Card className="mb-6">
                <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Button
                                size="sm"
                                variant="light"
                                startContent={<ArrowLeft className="w-4 h-4" />}
                                onPress={onBack}
                            >
                                Voltar
                            </Button>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                                    <User className="w-6 h-6" />
                                    {entregador.nome}
                                </h2>
                                <p className="text-gray-600">Entregas do entregador</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{entregasDoEntregador.length}</div>
                            <div className="text-sm text-gray-600">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pendente}</div>
                            <div className="text-sm text-gray-600">Pendentes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{statusCounts.em_transito}</div>
                            <div className="text-sm text-gray-600">Em Trânsito</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{statusCounts.entregue}</div>
                            <div className="text-sm text-gray-600">Entregues</div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card className="mb-6">
                <CardBody className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Filtros</h3>
                    <div className="flex gap-3">
                        <Button
                            size="sm"
                            variant={filtroStatus === '' ? 'solid' : 'flat'}
                            onPress={() => setFiltroStatus('')}
                        >
                            Todas ({entregasDoEntregador.length})
                        </Button>
                        <Button
                            size="sm"
                            color="warning"
                            variant={filtroStatus === 'pendente' ? 'solid' : 'flat'}
                            onPress={() => setFiltroStatus('pendente')}
                        >
                            Pendentes ({statusCounts.pendente})
                        </Button>
                        <Button
                            size="sm"
                            color="primary"
                            variant={filtroStatus === 'em_transito' ? 'solid' : 'flat'}
                            onPress={() => setFiltroStatus('em_transito')}
                        >
                            Em Trânsito ({statusCounts.em_transito})
                        </Button>
                        <Button
                            size="sm"
                            color="success"
                            variant={filtroStatus === 'entregue' ? 'solid' : 'flat'}
                            onPress={() => setFiltroStatus('entregue')}
                        >
                            Entregues ({statusCounts.entregue})
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Lista de entregas */}
            <div className="space-y-4">
                {entregasDoEntregador.length === 0 ? (
                    <Card className="w-full">
                        <CardBody className="p-8 text-center">
                            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Nenhuma entrega encontrada para este entregador.</p>
                        </CardBody>
                    </Card>
                ) : (
                    entregasDoEntregador.map((entrega) => (
                        <Card key={entrega.id} className="w-full">
                            <CardBody className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900">{entrega.cliente}</h3>
                                            <Chip 
                                                size="sm" 
                                                color={STATUS_CONFIG[entrega.status].color}
                                                variant="flat"
                                            >
                                                {STATUS_CONFIG[entrega.status].label}
                                            </Chip>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                            <span><strong>Endereço:</strong> {entrega.endereco}</span>
                                            <span><strong>Caixas:</strong> {entrega.numeroCaixas}</span>
                                            <span><strong>Embalador:</strong> {entrega.nomeEmbalador}</span>
                                            <span><strong>NFCe:</strong> {entrega.numeroNFCe}/{entrega.serieNFCe}</span>
                                            <span><strong>Compra:</strong> {formatarData(entrega.dataCompra)}</span>
                                            <span><strong>Entrega:</strong> {formatarDataHora(entrega.dataHoraEntrega)}</span>
                                        </div>
                                        {getVolumesExtrasTexto(entrega.volumesExtras) !== 'Nenhum' && (
                                            <div className="text-sm text-gray-600">
                                                <strong>Volumes extras:</strong> {getVolumesExtrasTexto(entrega.volumesExtras)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            color="secondary"
                                            variant="flat"
                                            onPress={() => handleDetails(entrega)}
                                        >
                                            Detalhes
                                        </Button>
                                    </div>
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
                                        <p className="text-gray-600">{entregaDetalhes.cliente}</p>
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
                                        <p className="text-gray-600">{entregaDetalhes.endereco}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Número de Caixas</p>
                                        <p className="text-gray-600">{entregaDetalhes.numeroCaixas}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Embalador</p>
                                        <p className="text-gray-600">{entregaDetalhes.nomeEmbalador}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Entregador</p>
                                        <p className="text-gray-600">{entregaDetalhes.nomeEntregador}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">NFCe</p>
                                        <p className="text-gray-600">{entregaDetalhes.numeroNFCe}/{entregaDetalhes.serieNFCe}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Data da Compra</p>
                                        <p className="text-gray-600">{formatarData(entregaDetalhes.dataCompra)}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Data/Hora da Entrega</p>
                                        <p className="text-gray-600">{formatarDataHora(entregaDetalhes.dataHoraEntrega)}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Criado em</p>
                                        <p className="text-gray-600">{formatarDataHora(entregaDetalhes.dataCriacao)}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="font-medium text-gray-900">Volumes Extras</p>
                                        <p className="text-gray-600">{getVolumesExtrasTexto(entregaDetalhes.volumesExtras)}</p>
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
        </>
    );
};

export default EntregasEntregador