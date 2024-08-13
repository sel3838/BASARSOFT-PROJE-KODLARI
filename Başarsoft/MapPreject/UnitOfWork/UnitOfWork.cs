using MapProject.Data;
using MapProject.Models;
using MapProject.Repositories;

namespace MapProject.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly MapDbContext _context;
        private IRepository<Point> _points;
        private IRepository<Polygon> _polygons;

        public UnitOfWork(MapDbContext context)
        {
            _context = context;
        }

        public IRepository<Point> Points => _points ??= new GenericRepository<Point>(_context);

        public IRepository<Polygon> Polygons => _polygons ??= new GenericRepository<Polygon>(_context);

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
