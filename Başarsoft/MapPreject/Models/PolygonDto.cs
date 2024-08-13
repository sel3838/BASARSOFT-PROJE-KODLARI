
namespace MapProject.Models
{
    public class PolygonDto
    {
        public int Id { get; internal set; }
        public string Wkt { get; set; }
        public string? Name { get; set; }
    }
}
