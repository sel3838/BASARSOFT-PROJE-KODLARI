using NetTopologySuite.Geometries;

namespace MapProject.Models
{
    public class Polygon
    {
        public int Id { get; internal set; }
        public Geometry? Wkt { get; set; }
        public string? WktString { get; set; }
        public string? Name { get; set; }

    }
}
