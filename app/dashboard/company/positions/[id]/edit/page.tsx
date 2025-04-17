'use client'

import { use } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { PositionModal } from '../../components/PositionModal'

interface Position {
  _id: string
  title: string
  companyName: string
  department: string
  location: string
  type: string
  workLocation: string
  description: string
  requirements: string[]
  questions: string[]
  minExperience: number
  maxExperience: number
  salaryRange: string
  applicationDeadline: string
  status: string
}

export default function EditPosition({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Unwrap params using React.use()
  const { id } = use(params)

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const response = await fetch(`/api/positions/${id}`)
        const data = await response.json()
        
        if (!data.success) {
          setError(data.error || 'Failed to fetch position')
          return
        }

        setPosition(data.position)
      } catch (error) {
        console.error('Error fetching position:', error)
        setError('Failed to fetch position')
      }
    }

    fetchPosition()
  }, [id])

  const handleSubmit = async (formData: Position) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/positions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!data.success) {
        toast({
          title: "Error",
          description: data.error || 'Failed to update position',
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: "Position updated successfully"
      })
      router.push('/dashboard/company/positions')
      router.refresh()
    } catch (error) {
      console.error('Error updating position:', error)
      toast({
        title: "Error",
        description: "Failed to update position",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PositionModal
        isOpen={true}
        onClose={() => router.push('/dashboard/company/positions')}
        onSubmit={handleSubmit}
        position={position}
        isLoading={isLoading}
      />
    </div>
  )
} 