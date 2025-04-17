"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

interface PositionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: any) => Promise<void>
  position?: {
    _id: string
    title: string
    department: string
    location: string
    type: string
    workLocation: string
    description: string
    requirements: string[]
    questions: string[]
    minExperience: number
    maxExperience: number
    salaryRange: {
      min: number
      max: number
    }
    active: boolean
    companyName: string
    lastDate: string
  }
}

interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  role: string
}

export function PositionModal({
  isOpen,
  onClose,
  onSubmit,
  position
}: PositionModalProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: position?.title || '',
    department: position?.department || '',
    location: position?.location || '',
    type: position?.type || 'Full-time',
    workLocation: position?.workLocation || 'Remote',
    description: position?.description || '',
    requirements: Array.isArray(position?.requirements) 
      ? position.requirements.join('\n')
      : position?.requirements || '',
    questions: Array.isArray(position?.questions)
      ? position.questions.join('\n')
      : position?.questions || '',
    minExperience: position?.minExperience || 0,
    maxExperience: position?.maxExperience || 5,
    salaryRange: position?.salaryRange || {
      min: 0,
      max: 0
    },
    active: position?.active ?? true,
    companyName: position?.companyName || '',
    lastDate: position?.lastDate || new Date().toISOString().slice(0, 16)
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (position) {
      setFormData({
        title: position.title,
        department: position.department,
        location: position.location,
        type: position.type,
        workLocation: position.workLocation,
        description: position.description,
        requirements: position.requirements.join("\n"),
        questions: position.questions.join("\n"),
        minExperience: position.minExperience,
        maxExperience: position.maxExperience,
        salaryRange: {
          min: position.salaryRange.min,
          max: position.salaryRange.max
        },
        active: position.active,
        companyName: position.companyName,
        lastDate: position.lastDate
      })
    } else {
      setFormData({
        title: "",
        department: "",
        location: "",
        type: "Full-time",
        workLocation: "Remote",
        description: "",
        requirements: "",
        questions: "",
        minExperience: 0,
        maxExperience: 5,
        salaryRange: {
          min: 0,
          max: 0
        },
        active: true,
        companyName: "",
        lastDate: new Date().toISOString().slice(0, 16)
      })
    }
  }, [position])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting position:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="sticky top-0 bg-background z-10">
            <DialogTitle>{position ? "Edit Position" : "Create New Position"}</DialogTitle>
            <DialogDescription>
              {position
                ? "Update the position details below."
                : "Fill in the details to create a new position."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastDate">Last Date to Complete Interview</Label>
                <Input
                  id="lastDate"
                  type="datetime-local"
                  value={formData.lastDate}
                  onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Employment Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workLocation">Work Location</Label>
                <Select
                  value={formData.workLocation}
                  onValueChange={(value) => setFormData({ ...formData, workLocation: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="On Site">On Site</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minExperience">Minimum Experience (years)</Label>
                <Input
                  id="minExperience"
                  type="number"
                  min="0"
                  value={formData.minExperience}
                  onChange={(e) => setFormData({ ...formData, minExperience: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxExperience">Maximum Experience (years)</Label>
                <Input
                  id="maxExperience"
                  type="number"
                  min="0"
                  value={formData.maxExperience}
                  onChange={(e) => setFormData({ ...formData, maxExperience: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Minimum Salary (₹K)</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  min="0"
                  value={formData.salaryRange.min}
                  onChange={(e) => setFormData({
                    ...formData,
                    salaryRange: { ...formData.salaryRange, min: Number(e.target.value) }
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Maximum Salary (₹K)</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  min="0"
                  value={formData.salaryRange.max}
                  onChange={(e) => setFormData({
                    ...formData,
                    salaryRange: { ...formData.salaryRange, max: Number(e.target.value) }
                  })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (one per line)</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questions">Interview Questions (one per line)</Label>
              <Textarea
                id="questions"
                value={formData.questions}
                onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="active" className="flex flex-col space-y-1">
                <span>Position Status</span>
                <span className="font-normal text-sm text-muted-foreground">
                  {formData.active ? "Position is active and visible to candidates" : "Position is inactive and hidden from candidates"}
                </span>
              </Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-background z-10">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : position ? "Update Position" : "Create Position"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 