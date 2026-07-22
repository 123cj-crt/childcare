package com.child2.service;

import com.child2.entity.Reservation;
import com.child2.repository.ReservationRepository;
import com.child2.repository.ChildRepository; // 导入ChildRepository
import com.child2.entity.Child; // 导入Child实体
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ChildRepository childRepository; // 注入ChildRepository

    public Reservation createReservation(Reservation reservation) {
        // 在这里可以添加业务逻辑，例如检查课程是否可用，学生是否已预约等
        // 根据studentId获取孩子名字并设置到reservation中
        if (reservation.getStudentId() != null) {
            Optional<Child> childOptional = childRepository.findById(reservation.getStudentId());
            childOptional.ifPresent(child -> reservation.setChildName(child.getChildName()));
        }
        return reservationRepository.save(reservation);
    }

    public List<Reservation> getAllReservations() {
        List<Reservation> reservations = reservationRepository.findAll();
        // 为每个预约填充孩子名字
        reservations.forEach(reservation -> {
            if (reservation.getStudentId() != null) {
                Optional<Child> childOptional = childRepository.findById(reservation.getStudentId());
                childOptional.ifPresent(child -> reservation.setChildName(child.getChildName()));
            }
        });
        return reservations;
    }

    public List<Reservation> getReservationsByCourseId(Long courseId) {
        List<Reservation> reservations = reservationRepository.findByCourseId(courseId);
        reservations.forEach(reservation -> {
            if (reservation.getStudentId() != null) {
                Optional<Child> childOptional = childRepository.findById(reservation.getStudentId());
                childOptional.ifPresent(child -> reservation.setChildName(child.getChildName()));
            }
        });
        return reservations;
    }

    public Optional<Reservation> getReservationById(Long id) {
        Optional<Reservation> reservationOptional = reservationRepository.findById(id);
        reservationOptional.ifPresent(reservation -> {
            if (reservation.getStudentId() != null) {
                Optional<Child> childOptional = childRepository.findById(reservation.getStudentId());
                childOptional.ifPresent(child -> reservation.setChildName(child.getChildName()));
            }
        });
        return reservationOptional;
    }

    public Reservation updateReservation(Long id, Reservation updatedReservation) {
        return reservationRepository.findById(id)
                .map(reservation -> {
                    reservation.setCourseId(updatedReservation.getCourseId());
                    reservation.setCourseName(updatedReservation.getCourseName());
                    reservation.setStudentId(updatedReservation.getStudentId());
                    // 更新孩子名字
                    if (updatedReservation.getStudentId() != null) {
                        Optional<Child> childOptional = childRepository.findById(updatedReservation.getStudentId());
                        childOptional.ifPresent(child -> reservation.setChildName(child.getChildName()));
                    } else {
                        reservation.setChildName(null);
                    }
                    reservation.setReservationDate(updatedReservation.getReservationDate());
                    reservation.setReservationTime(updatedReservation.getReservationTime());
                    reservation.setStatus(updatedReservation.getStatus());
                    return reservationRepository.save(reservation);
                })
                .orElseGet(() -> {
                    updatedReservation.setId(id);
                    // 创建新预约时也填充孩子名字
                    if (updatedReservation.getStudentId() != null) {
                        Optional<Child> childOptional = childRepository.findById(updatedReservation.getStudentId());
                        childOptional.ifPresent(child -> updatedReservation.setChildName(child.getChildName()));
                    }
                    return reservationRepository.save(updatedReservation);
                });
    }

    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }
}