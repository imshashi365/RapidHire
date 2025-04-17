'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, MapPin, DollarSign, Briefcase, ArrowLeft, ArrowRight } from "lucide-react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface Job {
  _id: string
  title: string
  companyName: string
  salary: string | {
    min: number
    max: number
    currency: string
  }
  location: string
  workLocation: 'remote' | 'hybrid' | 'onsite'
  companyLogo?: string
  createdAt: string
}

export function JobCarousel() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/positions/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch positions')
        }
        
        // Sort positions by creation date (newest first)
        const sortedJobs = (data.positions || []).sort((a: Job, b: Job) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        setJobs(sortedJobs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch positions')
        console.error('Error fetching positions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    if (jobs.length === 0) return
    
    setDirection(newDirection)
    const maxIndex = Math.max(0, jobs.length - 3)
    setCurrentIndex((prevIndex) => {
      let newIndex = prevIndex + (newDirection * 3)
      if (newIndex < 0) newIndex = maxIndex
      if (newIndex > maxIndex) newIndex = 0
      return newIndex
    })
  }

  const getWorkLocationColor = (workLocation: string) => {
    switch (workLocation.toLowerCase()) {
      case 'remote':
        return 'text-green-500'
      case 'hybrid':
        return 'text-blue-500'
      case 'onsite':
        return 'text-orange-500'
      default:
        return 'text-gray-500'
    }
  }

  const formatSalary = (salary: Job['salary']) => {
    if (!salary) return 'Salary not specified'

    if (typeof salary === 'string') return salary

    if (typeof salary === 'object' && 'min' in salary && 'max' in salary) {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: salary.currency || 'USD',
        maximumFractionDigits: 0
      })
      return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`
    }

    return 'Salary not specified'
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error: {error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-[#229799] text-white hover:bg-[#229799]/90"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-black/50 border border-[#229799]/20">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 bg-gray-700 mb-4" />
              <Skeleton className="h-4 w-1/2 bg-gray-700 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-2/3 bg-gray-700" />
                <Skeleton className="h-4 w-3/4 bg-gray-700" />
                <Skeleton className="h-4 w-1/2 bg-gray-700" />
              </div>
              <Skeleton className="h-10 w-full bg-gray-700 mt-6" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No positions available at the moment.</p>
      </div>
    )
  }

  const visibleJobs = jobs.slice(currentIndex, currentIndex + 3)

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Featured Positions</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => paginate(-1)}
            className="border-[#229799] text-[#229799] hover:bg-[#229799] hover:text-white"
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => paginate(1)}
            className="border-[#229799] text-[#229799] hover:bg-[#229799] hover:text-white"
            disabled={currentIndex >= jobs.length - 3}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative h-[400px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {visibleJobs.map((job, i) => (
              <Card 
                key={`${job._id}-${i}`}
                className="bg-black/50 border border-[#229799]/20 backdrop-blur-sm hover:border-[#229799]/50 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{job.title || 'Untitled Position'}</h3>
                      <div className="flex items-center text-gray-400">
                        <Building2 className="h-4 w-4 mr-1" />
                        <span>{job.companyName || 'Company Name Not Available'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-400">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{formatSalary(job.salary)}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{job.location || 'Location Not Specified'}</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span className={getWorkLocationColor(job.workLocation || 'remote')}>
                        {(job.workLocation || 'remote').charAt(0).toUpperCase() + (job.workLocation || 'remote').slice(1)}
                      </span>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-6 bg-[#229799] text-white hover:bg-[#229799]/90"
                    onClick={() => window.location.href = `/positions/${job._id}`}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-8">
        {Array.from({ length: Math.ceil(jobs.length / 3) }).map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => {
              setDirection(index > Math.floor(currentIndex / 3) ? 1 : -1)
              setCurrentIndex(index * 3)
            }}
            className={`h-2 w-2 rounded-full mx-1 transition-all duration-300 ${
              Math.floor(currentIndex / 3) === index ? 'bg-[#229799] w-4' : 'bg-gray-500'
            }`}
          />
        ))}
      </div>

      {jobs.length > 3 && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="border-[#229799] text-[#229799] hover:bg-[#229799] hover:text-white"
            onClick={() => window.location.href = '/positions'}
          >
            View All Positions →
          </Button>
        </div>
      )}
    </div>
  )
} 