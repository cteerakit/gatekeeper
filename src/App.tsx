import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Textarea } from "./components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table"

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Gatekeeper</h1>
          <Button variant="outline">Login with Facebook</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Create Post</CardTitle>
              <CardDescription>Draft a new post for your groups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group1">React Developers</SelectItem>
                  <SelectItem value="group2">Vite Enthusiasts</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="What's on your mind?" className="min-h-[120px]" />
              <Input type="file" accept="image/*" />
            </CardContent>
            <CardFooter>
              <Button className="w-full">Post to Group</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent History</CardTitle>
              <CardDescription>Your recent posting activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>React Developers</TableCell>
                    <TableCell className="text-green-500">Success</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Vite Enthusiasts</TableCell>
                    <TableCell className="text-yellow-500">Pending</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}

export default App
