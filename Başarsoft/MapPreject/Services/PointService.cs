using System.Linq;
using System.Collections.Generic;
using System.Linq;
using MapProject.Models;
namespace MapProject.Services
{


    public class PointService : IPointService
    {
        //private static readonly List<Point> _points = new List<Point>();

        //public List<Point> GetAll()
        //{
        //    return _points;
        //}

        //public Point GetById(int id)
        //{
        //    return _points.FirstOrDefault(p => p.Id == id);
        //}

        //public bool Add(Point point)
        //{
        //    try
        //    {
        //        var item = new Point
        //        {
        //            Id = _points.Count > 0 ? _points[^1].Id + 1 : 1,
        //            X = point.X,
        //            Y = point.Y,
        //            Name = point.Name,
        //        };

        //        _points.Add(item);
        //        return true;
        //    }
        //    catch (Exception)
        //    {
        //        return false;
        //    }
        //}

        //public bool Update(int id, Point updatedPoint)
        //{
        //    var point = _points.FirstOrDefault(p => p.Id == id);
        //    if (point == null)
        //    {
        //        return false;
        //    }

        //    try
        //    {
        //        point.X = updatedPoint.X;
        //        point.Y = updatedPoint.Y;
        //        point.Name = updatedPoint.Name;
        //        return true;
        //    }
        //    catch (Exception)
        //    {
        //        return false;
        //    }
        //}

        //public bool Delete(int id)
        //{
        //    var point = _points.FirstOrDefault(p => p.Id == id);
        //    if (point == null)
        //    {
        //        return false;
        //    }

        //    try
        //    {
        //        _points.Remove(point);
        //        return true;
        //    }
        //    catch (Exception)
        //    {
        //        return false;
        //    }
        //}
    }
}
