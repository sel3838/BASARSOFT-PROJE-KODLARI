using MapProject.Models;
using MapProject.Repositories;

namespace MapProject.UnitOfWork
{
        public interface IUnitOfWork
        {
            IRepository<Point> Points { get; }
            IRepository<Polygon> Polygons { get; }
            Task<int> CompleteAsync();
        }
    
}
