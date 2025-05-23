import axios from 'axios'
import { Entregador, EntregadorRes } from './_types'

const apiURL = import.meta.env.VITE_API_URL

const getEntregadores = async () => {
    const res = await axios.get<EntregadorRes[]>(`${apiURL}/entregadores`)
    return res
}

const postEntregador = async (form: Entregador) => {
    const res = await axios.post<EntregadorRes>(`${apiURL}/entregadores/`, form)
    return res
}

export {getEntregadores, postEntregador}