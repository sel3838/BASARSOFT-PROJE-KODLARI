using MapProject.Models;
using Microsoft.EntityFrameworkCore;

namespace MapProject.Data
{
    public class MapDbContext : DbContext
    {
        public MapDbContext(DbContextOptions<MapDbContext> options) : base(options) { }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Model oluşturma sırasında gerekli yapılandırmaları buraya ekleyebilirsiniz
            modelBuilder.Entity<Polygon>()
                .Property(p => p.Wkt)
                .HasColumnType("geometry"); // PostGIS geometry türü
        }


        public DbSet<Point> Points { get; set; }
        public DbSet<Polygon> Polygons { get; set; }
    }
}
