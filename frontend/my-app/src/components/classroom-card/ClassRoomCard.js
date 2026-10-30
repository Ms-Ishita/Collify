import { useRouter } from "next/navigation"

export default function ClassRoomCard({classroom}){
    const router = useRouter()

    const handleClick = () => {
        router.push(`/classrooms/${classroom._id}`)
    }

    return (
    <div
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '600' }}>
        {classroom.name}
      </h3>

      <p style={{ margin: '0 0 8px 0', color: '#4b5563' }}>
        Join Code: <strong style={{ color: '#4f46e5' }}>{classroom.joinCode}</strong>
      </p>

      <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
        Created: {new Date(classroom.createdAt).toLocaleDateString()}
      </p>
    </div>
  )

}