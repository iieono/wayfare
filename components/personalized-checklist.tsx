"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/client"
import { useAuth } from "@/components/auth-provider"
import { CheckCircle, Plus, Save, FileText } from "lucide-react"

interface ChecklistItem {
  id: string
  text: string
  category: string
  completed: boolean
  isCustom?: boolean
}

interface PersonalizedChecklistProps {
  countryId: number // Changed to use country ID instead of country code
  userType: string
}

export function PersonalizedChecklist({ countryId, userType }: PersonalizedChecklistProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [customItem, setCustomItem] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      loadChecklist()
    }
  }, [user, countryId, userType])

  const loadChecklist = async () => {
    try {
      // First, get the base template checklist
      const { data: templateData } = await supabase
        .from("checklists")
        .select("*")
        .eq("country", countryId) // Changed to use country ID
        .eq("user_type", userType)
        .eq("is_template", true)
        .single()

      // Then, get user's personalized version if it exists
      const { data: userChecklistData } = await supabase
        .from("user_checklists")
        .select("*")
        .eq("user_id", user!.id)
        .eq("checklist_id", templateData?.id || 0)
        .single()

      if (templateData) {
        const baseItems = convertToChecklistItems(templateData.required_items)
        const completedItems = userChecklistData?.completed_items || []
        const customItems = userChecklistData?.custom_items || {}

        // Merge base items with completion status
        const mergedItems = baseItems.map((item) => ({
          ...item,
          completed: completedItems.includes(item.id),
        }))

        // Add custom items
        if (customItems && typeof customItems === "object") {
          Object.entries(customItems).forEach(([category, items]: [string, any]) => {
            if (Array.isArray(items)) {
              items.forEach((item: string, index: number) => {
                mergedItems.push({
                  id: `custom-${category}-${index}`,
                  text: item,
                  category,
                  completed: completedItems.includes(`custom-${category}-${index}`),
                  isCustom: true,
                })
              })
            }
          })
        }

        setItems(mergedItems)
        setNotes(userChecklistData?.notes || "")
      }
    } catch (error) {
      console.error("Error loading checklist:", error)
    }
    setLoading(false)
  }

  const convertToChecklistItems = (requiredItems: any): ChecklistItem[] => {
    const items: ChecklistItem[] = []

    if (requiredItems && typeof requiredItems === "object") {
      Object.entries(requiredItems).forEach(([category, categoryItems]: [string, any]) => {
        if (Array.isArray(categoryItems)) {
          categoryItems.forEach((item: string, index: number) => {
            items.push({
              id: `${category}-${index}`,
              text: item,
              category,
              completed: false,
            })
          })
        }
      })
    }

    return items
  }

  const toggleItem = async (itemId: string) => {
    const updatedItems = items.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item))
    setItems(updatedItems)
    await saveProgress(updatedItems)
  }

  const addCustomItem = async () => {
    if (!customItem.trim()) return

    const newItem: ChecklistItem = {
      id: `custom-general-${Date.now()}`,
      text: customItem.trim(),
      category: "general",
      completed: false,
      isCustom: true,
    }

    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    setCustomItem("")
    await saveProgress(updatedItems)
  }

  const saveProgress = async (updatedItems: ChecklistItem[]) => {
    if (!user) return

    setSaving(true)
    try {
      const completedItems = updatedItems.filter((item) => item.completed).map((item) => item.id)

      const customItems: { [key: string]: string[] } = {}
      updatedItems
        .filter((item) => item.isCustom)
        .forEach((item) => {
          if (!customItems[item.category]) {
            customItems[item.category] = []
          }
          customItems[item.category].push(item.text)
        })

      // Get the template checklist ID
      const { data: templateData } = await supabase
        .from("checklists")
        .select("id")
        .eq("country", countryId) // Changed to use country ID
        .eq("user_type", userType)
        .eq("is_template", true)
        .single()

      if (templateData) {
        // Upsert user checklist
        await supabase.from("user_checklists").upsert({
          user_id: user.id,
          checklist_id: templateData.id,
          completed_items: completedItems,
          custom_items: customItems,
          notes,
        })
      }
    } catch (error) {
      console.error("Error saving progress:", error)
    }
    setSaving(false)
  }

  const getCompletionPercentage = () => {
    if (items.length === 0) return 0
    const completedCount = items.filter((item) => item.completed).length
    return Math.round((completedCount / items.length) * 100)
  }

  const groupItemsByCategory = () => {
    const grouped: { [key: string]: ChecklistItem[] } = {}
    items.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })
    return grouped
  }

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your personalized checklist...</p>
        </CardContent>
      </Card>
    )
  }

  const groupedItems = groupItemsByCategory()
  const completionPercentage = getCompletionPercentage()

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Your Travel Checklist
            </CardTitle>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {completionPercentage}% Complete
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Checklist Items */}
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <Card key={category} className="glass-card">
          <CardHeader>
            <CardTitle className="capitalize text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 group">
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={item.id}
                    className={`flex-1 text-sm cursor-pointer transition-all duration-200 ${
                      item.completed ? "line-through text-gray-500" : "text-gray-700 group-hover:text-gray-900"
                    }`}
                  >
                    {item.text}
                    {item.isCustom && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Custom
                      </Badge>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Custom Item */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Custom Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              value={customItem}
              onChange={(e) => setCustomItem(e.target.value)}
              placeholder="Add your own checklist item..."
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && addCustomItem()}
            />
            <Button onClick={addCustomItem} disabled={!customItem.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Personal Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your personal notes, reminders, or additional preparation steps..."
            className="min-h-[100px]"
          />
          <Button onClick={() => saveProgress(items)} disabled={saving} className="mt-3" size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Notes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
