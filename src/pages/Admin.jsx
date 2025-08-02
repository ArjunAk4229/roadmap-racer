import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Check, X, FileText, Users } from 'lucide-react';

const API_BASE_URL = 'http://localhost/your-api-path'; // Update this with your actual API URL

export default function Admin() {
  const [activeTab, setActiveTab] = useState('roadmaps');
  const [roadmaps, setRoadmaps] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_count: 0 });
  const { toast } = useToast();

  // Roadmap form state
  const [roadmapForm, setRoadmapForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });
  const [editingRoadmap, setEditingRoadmap] = useState(null);

  // Event form state
  const [eventForm, setEventForm] = useState({
    roadmap_id: '',
    title: '',
    description: '',
    points: 0
  });
  const [eventImage, setEventImage] = useState(null);

  // Filters and pagination
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const currentUser = 'admin'; // Replace with actual user from context/auth

  useEffect(() => {
    if (activeTab === 'roadmaps') {
      fetchRoadmaps();
    } else if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab, currentPage]);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roadmaps`);
      const data = await response.json();
      if (data.success) {
        setRoadmaps(data.roadmaps);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch roadmaps', variant: 'destructive' });
    }
    setLoading(false);
  };

  const fetchSubmissions = async (eventId = null, pendingOnly = false) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/admin/submissions?page=${currentPage}&limit=20`;
      
      if (eventId && pendingOnly) {
        url = `${API_BASE_URL}/event/submissions/pending?event_id=${eventId}&page=${currentPage}&limit=20`;
      } else if (eventId) {
        url = `${API_BASE_URL}/event/submissions?event_id=${eventId}&page=${currentPage}&limit=20`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch submissions', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleCreateRoadmap = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/roadmap/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...roadmapForm, userid: currentUser })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Roadmap created successfully' });
        setRoadmapForm({ title: '', description: '', start_date: '', end_date: '', status: 'active' });
        fetchRoadmaps();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create roadmap', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleUpdateRoadmap = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/roadmap`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...roadmapForm, roadmap_id: editingRoadmap.id })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Roadmap updated successfully' });
        setEditingRoadmap(null);
        setRoadmapForm({ title: '', description: '', start_date: '', end_date: '', status: 'active' });
        fetchRoadmaps();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update roadmap', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteRoadmap = async (roadmapId) => {
    if (!confirm('Are you sure you want to delete this roadmap? This will delete all associated events and submissions.')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/roadmap`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadmap_id: roadmapId })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Roadmap deleted successfully' });
        fetchRoadmaps();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete roadmap', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('roadmap_id', eventForm.roadmap_id);
      formData.append('title', eventForm.title);
      formData.append('description', eventForm.description);
      formData.append('points', eventForm.points);
      if (eventImage) {
        formData.append('event_image', eventImage);
      }

      const response = await fetch(`${API_BASE_URL}/roadmap/event`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Event created successfully' });
        setEventForm({ roadmap_id: '', title: '', description: '', points: 0 });
        setEventImage(null);
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create event', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This will delete all associated submissions.')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/roadmap/event`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Event deleted successfully' });
        // Refresh current view
        if (activeTab === 'submissions') {
          fetchSubmissions(selectedEventId);
        }
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleReviewSubmission = async (submission, status) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/roadmap/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: submission.event_id,
          student_id: submission.student_id,
          roadmap_id: submission.roadmap_id,
          status,
          currentuser: currentUser
        })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: `Submission ${status} successfully` });
        fetchSubmissions(selectedEventId);
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to review submission', variant: 'destructive' });
    }
    setLoading(false);
  };

  const startEditRoadmap = (roadmap) => {
    setEditingRoadmap(roadmap);
    setRoadmapForm({
      title: roadmap.title,
      description: roadmap.description,
      start_date: roadmap.start_date || '',
      end_date: roadmap.end_date || '',
      status: roadmap.status
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        <TabsContent value="roadmaps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingRoadmap ? 'Edit Roadmap' : 'Create New Roadmap'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingRoadmap ? handleUpdateRoadmap : handleCreateRoadmap} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      value={roadmapForm.title}
                      onChange={(e) => setRoadmapForm({ ...roadmapForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={roadmapForm.status}
                      onChange={(e) => setRoadmapForm({ ...roadmapForm, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={roadmapForm.description}
                    onChange={(e) => setRoadmapForm({ ...roadmapForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={roadmapForm.start_date}
                      onChange={(e) => setRoadmapForm({ ...roadmapForm, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <Input
                      type="date"
                      value={roadmapForm.end_date}
                      onChange={(e) => setRoadmapForm({ ...roadmapForm, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {editingRoadmap ? 'Update' : 'Create'} Roadmap
                  </Button>
                  {editingRoadmap && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setEditingRoadmap(null);
                        setRoadmapForm({ title: '', description: '', start_date: '', end_date: '', status: 'active' });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Roadmaps</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roadmaps.map((roadmap) => (
                    <TableRow key={roadmap.id}>
                      <TableCell>{roadmap.title}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          roadmap.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {roadmap.status}
                        </span>
                      </TableCell>
                      <TableCell>{roadmap.event_count}</TableCell>
                      <TableCell>{roadmap.created_by_name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEditRoadmap(roadmap)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteRoadmap(roadmap.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Roadmap</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={eventForm.roadmap_id}
                    onChange={(e) => setEventForm({ ...eventForm, roadmap_id: e.target.value })}
                    required
                  >
                    <option value="">Select Roadmap</option>
                    {roadmaps.map((roadmap) => (
                      <option key={roadmap.id} value={roadmap.id}>
                        {roadmap.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Points</label>
                    <Input
                      type="number"
                      value={eventForm.points}
                      onChange={(e) => setEventForm({ ...eventForm, points: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Event Image (optional)</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEventImage(e.target.files[0])}
                  />
                </div>
                <Button type="submit" disabled={loading}>Create Event</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>View Submissions</CardTitle>
              <CardDescription>Filter submissions by event or view all pending submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <select
                  className="p-2 border rounded-md"
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setCurrentPage(1);
                    fetchSubmissions(e.target.value);
                  }}
                >
                  <option value="">All Submissions</option>
                  {roadmaps.map((roadmap) => (
                    <optgroup key={roadmap.id} label={roadmap.title}>
                      {/* Note: You'll need to fetch events for each roadmap to populate this */}
                    </optgroup>
                  ))}
                </select>
                <Button onClick={() => fetchSubmissions(selectedEventId, true)}>
                  Show Pending Only
                </Button>
                <Button onClick={() => fetchSubmissions(selectedEventId, false)}>
                  Show All
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roadmap</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={`${submission.student_id}-${submission.event_id}`}>
                      <TableCell>{submission.student_name}</TableCell>
                      <TableCell>{submission.roadmap_title}</TableCell>
                      <TableCell>{submission.event_title}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          submission.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : submission.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {submission.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(submission.submitted_at).toLocaleDateString()}</TableCell>
                      <TableCell>{submission.points_earned || 0}/{submission.points}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {submission.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleReviewSubmission(submission, 'approved')}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReviewSubmission(submission, 'rejected')}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination.total_pages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    {pagination.current_page > 1 && (
                      <PaginationItem>
                        <PaginationPrevious onClick={() => {
                          setCurrentPage(pagination.current_page - 1);
                          fetchSubmissions(selectedEventId);
                        }} />
                      </PaginationItem>
                    )}
                    
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            isActive={page === pagination.current_page}
                            onClick={() => {
                              setCurrentPage(page);
                              fetchSubmissions(selectedEventId);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {pagination.current_page < pagination.total_pages && (
                      <PaginationItem>
                        <PaginationNext onClick={() => {
                          setCurrentPage(pagination.current_page + 1);
                          fetchSubmissions(selectedEventId);
                        }} />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Review Dashboard</CardTitle>
              <CardDescription>Pending submissions requiring review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Use the Submissions tab to review pending submissions</p>
                <Button onClick={() => setActiveTab('submissions')}>
                  View All Submissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}