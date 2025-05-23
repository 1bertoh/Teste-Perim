import { useEffect, useState } from 'react';
import { Button } from '@heroui/button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { useDisclosure } from '@heroui/modal';
import { User} from 'lucide-react';
import { Entrega, Entregador, EntregadorRes } from './_types';
import EntregasEntregador from './_entregas';
import EntregadorForm from './_form';
import EntregadorList from './_list';
import DefaultLayout from '@/layouts/default';
import { getEntregadores, postEntregador } from './_requests';
import { addToast } from '@heroui/toast';

const Page = () => {
    const [entregadores, setEntregadores] = useState<EntregadorRes[]>([]);

    const entregas: Entrega[] = [];

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [entregadorSelecionado, setEntregadorSelecionado] = useState<Entregador | null>(null);
    const [entregadorExclusao, setEntregadorExclusao] = useState<number | null>(null);

    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    const handleAddEntregador = async (nome: string) => {
        const novoEntregador: Entregador = {
            id: Date.now(),
            nome,
        };
        try {
            const res = await postEntregador(novoEntregador);
            
            setEntregadores(prev => [...prev, res.data]);
            setMostrarFormulario(false);

            addToast({
                title: "Entregador criado com sucesso!",
                color: "success"
            })
        } catch(e) {
            addToast({
                title: "Houve um erro ao criar o entregador!",
                color: "danger"
            })

        }
    };

    const handleDeleteEntregador = (id: number) => {
        setEntregadorExclusao(id);
        onDeleteOpen();
    };

    const confirmarExclusao = () => {
        if (entregadorExclusao) {
            setEntregadores(prev => prev.filter(e => e.id !== entregadorExclusao));
            setEntregadorExclusao(null);
            onDeleteClose();
        }
    };

    const handleSelectEntregador = (entregador: Entregador) => {
        setEntregadorSelecionado(entregador);
    };

    const handleBackToList = () => {
        setEntregadorSelecionado(null);
    };

    useEffect(() => {
        const fetch = async () => {
            const res = await getEntregadores()
            setEntregadores(res.data)
            console.log(res)
        }
        fetch()
    }, [])

    return (
        <DefaultLayout>
            <div className="px-10 md:px-20 lg:px-40 flex flex-1 justify-center">
                <main className="flex flex-col w-full max-w-2xl py-5">
                    <div className="flex flex-col w-full max-w-7xl py-5 px-4">
                        {entregadorSelecionado ? (
                            <EntregasEntregador
                                entregador={entregadorSelecionado}
                                entregas={entregas}
                                onBack={handleBackToList}
                            />
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">Entregadores</h1>
                                        <p className="text-gray-600">Gerencie os entregadores e suas entregas</p>
                                    </div>
                                    {!mostrarFormulario && (
                                        <Button
                                            onPress={() => setMostrarFormulario(true)}
                                            startContent={<User className="w-4 h-4" />}
                                            className='bg-[#45e519] font-bold'
                                        >
                                            Novo Entregador
                                        </Button>
                                    )}
                                </div>

                                {mostrarFormulario && (
                                    <EntregadorForm
                                        onAdd={handleAddEntregador}
                                        onCancel={() => setMostrarFormulario(false)}
                                    />
                                )}

                                <EntregadorList
                                    entregadores={entregadores}
                                    entregas={entregas}
                                    onSelectEntregador={handleSelectEntregador}
                                    onDeleteEntregador={handleDeleteEntregador}
                                />

                                <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                                    <ModalContent>
                                        <ModalHeader>
                                            <h2 className="text-xl font-semibold text-red-600">Confirmar Exclusão</h2>
                                        </ModalHeader>
                                        <ModalBody>
                                            {entregadorExclusao && (
                                                <p>
                                                    Tem certeza que deseja excluir este entregador?
                                                    Esta ação não pode ser desfeita.
                                                </p>
                                            )}
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button variant="light" onPress={onDeleteClose}>
                                                Cancelar
                                            </Button>
                                            <Button color="danger" onPress={confirmarExclusao}>
                                                Excluir Entregador
                                            </Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </DefaultLayout>
    );
};

export default Page;