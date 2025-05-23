import axios from 'axios'
import { Entrega, EntregaRes } from './_type'

const apiURL = import.meta.env.VITE_API_URL


const getEntregas = async () => {
    const res = await axios.get<EntregaRes[]>(`${apiURL}/entregas/`)
    return res
}

const postEntrega = async (form: Entrega) => {
    const res = await axios.post<EntregaRes>(`${apiURL}/entregas/`, form)
    return res
}

const putEntrega = async (form: EntregaRes) => {
    const res = await axios.put<EntregaRes>(`${apiURL}/entregas/${form.id}/`, {...form, entregador: form.entregador.id})
    return res
}

export {getEntregas, postEntrega, putEntrega}