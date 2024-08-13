using MapProject.Models;
using MapProject.UnitOfWork;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace MapProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowSpecificOrigin")]
    public class PointController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public PointController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var points = await _unitOfWork.Points.GetAllAsync();
            return Ok(points);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Point point)
        {
            await _unitOfWork.Points.AddAsync(point);
            await _unitOfWork.CompleteAsync();
            return Ok(point);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var point = await _unitOfWork.Points.GetByIdAsync(id);
            if (point == null)
            {
                return NotFound();
            }
            _unitOfWork.Points.Remove(point);
            await _unitOfWork.CompleteAsync();
            return Ok(point);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Point pointUpdate)
        {
            var point = await _unitOfWork.Points.GetByIdAsync(id);
            if (point == null)
            {
                return NotFound();
            }
            else
            {
                point.Name = pointUpdate.Name;
                point.X = pointUpdate.X;
                point.Y = pointUpdate.Y;

                _unitOfWork.Points.Update(point);
                await _unitOfWork.CompleteAsync();
                return Ok(point);

            }
        }
    }
}
