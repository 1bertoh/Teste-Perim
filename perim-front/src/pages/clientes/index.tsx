import { useState } from 'react';
import DefaultLayout from '@/layouts/default';
import { Tabs, Tab } from "@heroui/tabs";
import RegisterClients from './_register';
import ListClients from './_list';

type SelectionType = 'list' | 'register';

const CadastroClienteForm = () => {
    const [selection, setSelection] = useState<SelectionType>('register')
    const title = {
        list: {
            title: 'Clientes',
            subtitle: 'Gerencie os clientes cadastrados no sistema.'
        },
        register: {
            title: 'Cadastro de Cliente',
            subtitle: 'Preencha os dados do cliente e seus endereços de entrega.'
        },
    }

    return (
        <DefaultLayout>
            <div className="flex h-full grow flex-col">
                <main className="px-10 md:px-20 lg:px-40 flex flex-1 justify-center">
                    <div className="flex flex-col w-full max-w-2xl py-5">
                        <div className="mb-8">
                            <h1 className="text-gray-900 text-3xl font-bold leading-tight tracking-tight">{title[selection].title}</h1>
                            <p className="text-gray-600 mt-1">{title[selection].subtitle}</p>
                        </div>
                        <Tabs onSelectionChange={(s) => setSelection(s as SelectionType)} aria-label="Options">
                            <Tab key="register" title="Cadastrar">
                                <RegisterClients/>
                            </Tab>
                            <Tab key="list" title="Listar">
                                <ListClients/>
                            </Tab>
                        </Tabs>
                    </div>
                </main>
            </div>
        </DefaultLayout>
    );
};

export default CadastroClienteForm;