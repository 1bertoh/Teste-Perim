import { Card, CardBody } from "@heroui/card";
import { Package, Truck, User } from "lucide-react";
import { Entrega, Entregador, EntregadorRes } from "./_types";
import { Button } from "@heroui/button";

type props = {
    entregadores: EntregadorRes[];
    entregas: Entrega[];
    onSelectEntregador: (entregador: Entregador) => void;
    onDeleteEntregador: (id: number) => void;
}

const EntregadorList = (props: props) => {
    const {entregadores, entregas, onDeleteEntregador, onSelectEntregador} = props
    const getEntregasCount = (nomeEntregador: string) => {
        return entregas.filter(e => e.nomeEntregador === nomeEntregador).length;
    };

    const getEntregasPendentes = (nomeEntregador: string) => {
        return entregas.filter(e => e.nomeEntregador === nomeEntregador && e.status === 'pendente').length;
    };

    return (
        <div className="space-y-4">
            {entregadores.length === 0 ? (
                <Card className="w-full">
                    <CardBody className="p-8 text-center">
                        <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Nenhum entregador cadastrado.</p>
                    </CardBody>
                </Card>
            ) : (
                entregadores.map((entregador) => (
                    <Card key={entregador.id} className="w-full hover:shadow-md transition-shadow">
                        <CardBody className="p-6">
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <User className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-xl font-semibold text-gray-900">{entregador.nome}</h3>
                                    </div>
                                    <div className="flex gap-6 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4" />
                                            <span>Total de entregas: <strong>{getEntregasCount(entregador.nome)}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-4 h-4" />
                                            <span>Pendentes: <strong>{getEntregasPendentes(entregador.nome)}</strong></span>
                                        </div>
                                        <span>Cadastrado em: {new Date(entregador.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        size="sm"
                                        color="primary"
                                        variant="flat"
                                        onPress={() => onSelectEntregador(entregador)}
                                    >
                                        Ver Entregas
                                    </Button>
                                    <Button
                                        size="sm"
                                        color="danger"
                                        variant="flat"
                                        onPress={() => onDeleteEntregador(entregador.id)}
                                    >
                                        Excluir
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))
            )}
        </div>
    );
};

export default EntregadorList