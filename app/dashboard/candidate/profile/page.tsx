"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CandidateDashboardHeader } from "@/components/candidate-dashboard-header"
import { CandidateDashboardSidebar } from "@/components/candidate-dashboard-sidebar"
import { Briefcase, GraduationCap, MapPin, Mail, Phone, Globe, Upload, Edit, Save, Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Experience {
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface Education {
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface Skill {
  name: string
  level: string
}

interface Profile {
  _id?: string
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  user: {
    name: string
    email: string
    phone: string
    location: string
    website: string
    bio: string
    avatar: string
  }
}

const ProfilePage = () => {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<Profile>({
    experience: [],
    education: [],
    skills: [],
    user: {
      email: session?.user?.email || "",
      name: "",
      phone: "",
      location: "",
      website: "",
      bio: "",
      avatar: ""
    }
  })

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/candidate/profile")
      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session?.user?.id, fetchProfile])

  // Memoize handlers to prevent unnecessary re-renders
  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Validate required fields
      if (!profile.user.name) {
        toast.error("Name is required")
        return
      }

      // Create a clean profile object without any MongoDB-specific fields
      const cleanProfile = {
        experience: profile.experience.map(exp => ({
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.current,
          description: exp.description
        })),
        education: profile.education.map(edu => ({
          school: edu.school,
          degree: edu.degree,
          field: edu.field,
          startDate: edu.startDate,
          endDate: edu.endDate,
          current: edu.current,
          description: edu.description
        })),
        skills: profile.skills.map(skill => ({
          name: skill.name,
          level: skill.level
        })),
        user: {
          name: profile.user.name,
          email: profile.user.email,
          phone: profile.user.phone,
          location: profile.user.location,
          website: profile.user.website,
          bio: profile.user.bio,
          avatar: profile.user.avatar
        }
      }

      const response = await fetch("/api/candidate/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanProfile),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || "Failed to update profile"
        console.error("Profile update error:", errorMessage)
        throw new Error(errorMessage)
      }

      setProfile(data)
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }, [profile])

  const handleUserChange = useCallback((field: keyof Profile['user'], value: string) => {
    setProfile(prev => ({
      ...prev,
      user: {
        ...prev.user,
        [field]: value
      }
    }))
  }, [])

  const handleAddExperience = useCallback(() => {
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: ""
      }]
    }))
  }, [])

  const handleAddEducation = useCallback(() => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, {
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        current: false,
        description: ""
      }]
    }))
  }, [])

  const handleAddSkill = useCallback(() => {
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, {
        name: "",
        level: "Intermediate"
      }]
    }))
  }, [])

  const handleRemoveExperience = useCallback((index: number) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }, [])

  const handleRemoveEducation = useCallback((index: number) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }, [])

  const handleRemoveSkill = useCallback((index: number) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }, [])

  const handleExperienceChange = (index: number, field: keyof Experience, value: string | boolean) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const handleEducationChange = (index: number, field: keyof Education, value: string | boolean) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const handleSkillChange = (index: number, field: keyof Skill, value: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CandidateDashboardHeader />

      <div className="flex flex-1">
        <CandidateDashboardSidebar />

        <main className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">My Profile</h1>
                  <p className="text-gray-500">Manage your personal information and career details</p>
                </div>
                {isEditing ? (
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your personal and contact details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center space-y-3">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.user.avatar} alt={profile.user.name} />
                        <AvatarFallback>{profile.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Change Photo
                        </Button>
                      )}
                    </div>

                    <Separator />

                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profile.user.name}
                            onChange={(e) => handleUserChange("name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profile.user.email}
                            onChange={(e) => handleUserChange("email", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={profile.user.phone}
                            onChange={(e) => handleUserChange("phone", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profile.user.location}
                            onChange={(e) => handleUserChange("location", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={profile.user.website}
                            onChange={(e) => handleUserChange("website", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profile.user.bio}
                            onChange={(e) => handleUserChange("bio", e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{profile.user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{profile.user.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{profile.user.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <span>{profile.user.website}</span>
                        </div>
                        <Separator />
                        <div>
                          <h3 className="font-medium mb-2">About Me</h3>
                          <p className="text-sm text-gray-700">{profile.user.bio}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                  <Tabs defaultValue="experience" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="experience">Experience</TabsTrigger>
                      <TabsTrigger value="education">Education</TabsTrigger>
                      <TabsTrigger value="skills">Skills</TabsTrigger>
                    </TabsList>

                    <TabsContent value="experience" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Work Experience</h2>
                        {isEditing && (
                          <Button variant="outline" size="sm" onClick={handleAddExperience}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Experience
                          </Button>
                        )}
                      </div>

                      <div className="space-y-6">
                        {profile.experience?.length > 0 ? (
                          profile.experience.map((exp, index) => (
                            <Card key={index}>
                              <CardContent className="p-6">
                                {isEditing ? (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor={`job-title-${index}`}>Job Title</Label>
                                        <Input 
                                          id={`job-title-${index}`} 
                                          value={exp.title}
                                          onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`company-${index}`}>Company</Label>
                                        <Input 
                                          id={`company-${index}`} 
                                          value={exp.company}
                                          onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor={`start-date-${index}`}>Start Date</Label>
                                        <Input 
                                          id={`start-date-${index}`} 
                                          value={exp.startDate}
                                          onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`end-date-${index}`}>End Date</Label>
                                        <Input 
                                          id={`end-date-${index}`} 
                                          value={exp.endDate}
                                          onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`location-${index}`}>Location</Label>
                                      <Input 
                                        id={`location-${index}`} 
                                        value={exp.location}
                                        onChange={(e) => handleExperienceChange(index, "location", e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`description-${index}`}>Description</Label>
                                      <Textarea 
                                        id={`description-${index}`} 
                                        value={exp.description}
                                        onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
                                      />
                                    </div>
                                    <div className="flex justify-end">
                                      <Button variant="destructive" size="sm" onClick={() => handleRemoveExperience(index)}>
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <h3 className="font-semibold text-lg">{exp.title}</h3>
                                      <Badge variant="outline">
                                        {exp.startDate} - {exp.endDate}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                                      <Briefcase className="h-4 w-4" />
                                      <span>{exp.company}</span>
                                      <span>•</span>
                                      <MapPin className="h-4 w-4" />
                                      <span>{exp.location}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{exp.description}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <Card>
                            <CardContent className="p-6 text-center text-gray-500">
                              No experience added yet
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="education" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Education</h2>
                        {isEditing && (
                          <Button variant="outline" size="sm" onClick={handleAddEducation}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Education
                          </Button>
                        )}
                      </div>

                      <div className="space-y-6">
                        {profile.education.map((edu, index) => (
                          <Card key={index}>
                            <CardContent className="p-6">
                              {isEditing ? (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor={`degree-${index}`}>Degree</Label>
                                      <Input 
                                        id={`degree-${index}`} 
                                        value={edu.degree}
                                        onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`school-${index}`}>School</Label>
                                      <Input 
                                        id={`school-${index}`} 
                                        value={edu.school}
                                        onChange={(e) => handleEducationChange(index, "school", e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor={`edu-start-date-${index}`}>Start Date</Label>
                                      <Input 
                                        id={`edu-start-date-${index}`} 
                                        value={edu.startDate}
                                        onChange={(e) => handleEducationChange(index, "startDate", e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`edu-end-date-${index}`}>End Date</Label>
                                      <Input 
                                        id={`edu-end-date-${index}`} 
                                        value={edu.endDate}
                                        onChange={(e) => handleEducationChange(index, "endDate", e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`field-${index}`}>Field of Study</Label>
                                    <Input 
                                      id={`field-${index}`} 
                                      value={edu.field}
                                      onChange={(e) => handleEducationChange(index, "field", e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`edu-description-${index}`}>Description</Label>
                                    <Textarea 
                                      id={`edu-description-${index}`} 
                                      value={edu.description}
                                      onChange={(e) => handleEducationChange(index, "description", e.target.value)}
                                    />
                                  </div>
                                  <div className="flex justify-end">
                                    <Button variant="destructive" size="sm" onClick={() => handleRemoveEducation(index)}>
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-lg">{edu.degree}</h3>
                                    <Badge variant="outline">
                                      {edu.startDate} - {edu.endDate}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                                    <GraduationCap className="h-4 w-4" />
                                    <span>{edu.school}</span>
                                    <span>•</span>
                                    <MapPin className="h-4 w-4" />
                                    <span>{edu.field}</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{edu.description}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="skills" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Skills</h2>
                        {isEditing && (
                          <Button variant="outline" size="sm" onClick={handleAddSkill}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Skill
                          </Button>
                        )}
                      </div>

                      <Card>
                        <CardContent className="p-6">
                          {isEditing ? (
                            <div className="space-y-4">
                              {profile.skills.map((skill, index) => (
                                <div key={index} className="flex items-center gap-4">
                                  <div className="flex-1 space-y-2">
                                    <Label htmlFor={`skill-name-${index}`}>Skill Name</Label>
                                    <Input 
                                      id={`skill-name-${index}`} 
                                      value={skill.name}
                                      onChange={(e) => handleSkillChange(index, "name", e.target.value)}
                                    />
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <Label htmlFor={`skill-level-${index}`}>Level</Label>
                                    <Select
                                      value={skill.level}
                                      onValueChange={(value) => handleSkillChange(index, "level", value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                        <SelectItem value="Expert">Expert</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={() => handleRemoveSkill(index)}
                                    className="mt-6"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {profile.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">
                                  {skill.name} ({skill.level})
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default ProfilePage

