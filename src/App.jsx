import React from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Tooltip,Legend } from 'chart.js'
import { ethers } from 'ethers'

ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Tooltip,Legend)

export default function App(){
  return <div className='p-6'>BlueCarbon Prototype Running ✅</div>
}