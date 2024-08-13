using MapProject.Models;
using MapProject.UnitOfWork;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using NetTopologySuite.Geometries;
using Polygon = MapProject.Models.Polygon;

namespace MapProject.Controllers

{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowSpecificOrigin")]
    public class PolygonController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public PolygonController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var polygon = await _unitOfWork.Polygons.GetAllAsync();
            List<PolygonDto> result = new List<PolygonDto>();

            foreach (var item in polygon)
            {
                //var geometry = wktReader.Read(item.Wkt.ToString()); // Buraya WKT stringini koyun

                result.Add(new PolygonDto
                {
                    Id = item.Id,
                    Name= item.Name,
                    Wkt = item.WktString.ToString()
                });
            }
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Polygon polygon)
        {
            try
            {
                var reader = new NetTopologySuite.IO.WKTReader();
                Geometry geometry = reader.Read(polygon.WktString);


                // Z boyutunu kaldırmak için yeni bir 2D geometri oluşturun
                var factory = new GeometryFactory(new PrecisionModel(), 3857);
                var coordinates = geometry.Coordinates.Select(c => new Coordinate(c.X, c.Y)).ToArray();
                var geometry2D = factory.CreatePolygon(coordinates);

                polygon.Wkt = geometry2D;

                await _unitOfWork.Polygons.AddAsync(polygon);
                await _unitOfWork.CompleteAsync();

            }
            catch (Exception ex)
            {
                var a = 1;
            }
            return Ok();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var polygon = await _unitOfWork.Polygons.GetByIdAsync(id);
            if (polygon == null)
            {
                return NotFound();
            }
            _unitOfWork.Polygons.Remove(polygon);
            await _unitOfWork.CompleteAsync();
            return Ok();
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Polygon polygonUpdate)
        {
            var polygon = await _unitOfWork.Polygons.GetByIdAsync(id);
            if (polygon == null)
            {
                return NotFound();
            }
            else
            {
                polygon.Name = polygonUpdate.Name;

                var reader = new NetTopologySuite.IO.WKTReader();
                Geometry geometry = reader.Read(polygon.WktString);


                // Z boyutunu kaldırmak için yeni bir 2D geometri oluşturun
                var factory = new GeometryFactory(new PrecisionModel(), 3857);
                var coordinates = geometry.Coordinates.Select(c => new Coordinate(c.X, c.Y)).ToArray();
                var geometry2D = factory.CreatePolygon(coordinates);


                polygon.Wkt = geometry2D;
                polygon.WktString = polygonUpdate.WktString;

                _unitOfWork.Polygons.Update(polygon);
                await _unitOfWork.CompleteAsync();
                return Ok();

            }

        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPolygonForId(int id)
        {
            var polygon = await _unitOfWork.Polygons.GetByIdAsync(id);
            if (polygon == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(polygon.WktString);
            }
            
        }
    }

}

