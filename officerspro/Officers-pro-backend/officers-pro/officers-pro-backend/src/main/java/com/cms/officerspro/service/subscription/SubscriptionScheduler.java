package com.cms.officerspro.service.subscription;

import com.cms.officerspro.entity.Officer;
import com.cms.officerspro.repository.OfficerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubscriptionScheduler {

    @Autowired
    private OfficerRepo officerRepo;

    @Autowired
    private SubscriptionService subscriptionService;

    @Scheduled(cron = "0 0 0 * * ?")
    public void updateSubscriptions() {
        List<Officer> officers = officerRepo.findAll();
        for (Officer officer : officers) {
            if (officer.getRemainingDays() > 0) {
                officer.setRemainingDays(officer.getRemainingDays() - 1);
                officerRepo.save(officer);
            }
        }
    }
}
